/**
 * Push Notifications & Audio/Vibration Irregularity Alert Utility
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a clinical urgency alert tone
 * type: 'critical' = high-pitched dual beep; 'normal' = pleasant medical confirmation chime
 */
export function playAlertChime(type: 'critical' | 'normal' = 'normal') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'critical') {
      // Dual high-priority cardiac alarm
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.setValueAtTime(660, now + 0.15); // E5
      osc1.frequency.setValueAtTime(880, now + 0.3); // A5

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1760, now); // Harmonics

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.5);
      osc2.stop(now + 0.5);
    } else {
      // Soft confirmation chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.3); // G5

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch (err) {
    console.warn('Audio chime playback error:', err);
  }
}

/**
 * Trigger device haptic vibration if supported
 */
export function triggerHaptic(pattern: number[] = [150, 80, 150]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors
    }
  }
}

/**
 * Request notification permission from browser
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (e) {
      console.warn('Notification permission request error:', e);
      return false;
    }
  }
  return false;
}

/**
 * Dispatch a high-priority push notification for detected arrhythmias or STEMI
 */
export function sendIrregularityAlert(title: string, body: string, isCritical = true) {
  // Always trigger sound & haptics
  playAlertChime(isCritical ? 'critical' : 'normal');
  triggerHaptic(isCritical ? [300, 100, 300, 100, 400] : [100]);

  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'cardiopulse-alert',
        requireInteraction: isCritical,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (err) {
      console.warn('Notification dispatch error:', err);
    }
  }
}
