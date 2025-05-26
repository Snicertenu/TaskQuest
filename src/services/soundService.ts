import { Audio } from 'expo-av';

export class SoundService {
  private static sounds: { [key: string]: Audio.Sound } = {};
  private static isMuted: boolean = false;
  private static volume: number = 1.0;
  private static isPreloaded: boolean = false;

  public static async loadSounds(): Promise<void> {
    if (this.isPreloaded) return;

    try {
      // Combat sounds
      this.sounds['basic_attack'] = new Audio.Sound();
      await this.sounds['basic_attack'].loadAsync(require('../assets/sounds/basic_attack.mp3'));

      this.sounds['special_attack'] = new Audio.Sound();
      await this.sounds['special_attack'].loadAsync(require('../assets/sounds/special_attack.mp3'));

      this.sounds['ultimate_attack'] = new Audio.Sound();
      await this.sounds['ultimate_attack'].loadAsync(require('../assets/sounds/ultimate_attack.mp3'));

      // Reward sounds
      this.sounds['xp_gain'] = new Audio.Sound();
      await this.sounds['xp_gain'].loadAsync(require('../assets/sounds/xp_gain.mp3'));

      this.sounds['gold_gain'] = new Audio.Sound();
      await this.sounds['gold_gain'].loadAsync(require('../assets/sounds/gold_gain.mp3'));

      this.sounds['item_gain'] = new Audio.Sound();
      await this.sounds['item_gain'].loadAsync(require('../assets/sounds/item_gain.mp3'));

      // Achievement sounds
      this.sounds['achievement'] = new Audio.Sound();
      await this.sounds['achievement'].loadAsync(require('../assets/sounds/achievement.mp3'));

      // Level up sound
      this.sounds['level_up'] = new Audio.Sound();
      await this.sounds['level_up'].loadAsync(require('../assets/sounds/level_up.mp3'));

      // Set initial volume for all sounds
      await Promise.all(
        Object.values(this.sounds).map(sound => sound.setVolumeAsync(this.volume))
      );

      this.isPreloaded = true;
    } catch (error) {
      console.error('Error loading sounds:', error);
    }
  }

  public static async playSound(soundName: string): Promise<void> {
    if (this.isMuted) return;

    try {
      const sound = this.sounds[soundName];
      if (sound) {
        await sound.setPositionAsync(0);
        await sound.setVolumeAsync(this.volume);
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  public static async playCombatSound(attackType: string): Promise<void> {
    const soundName = `${attackType}_attack`;
    await this.playSound(soundName);
  }

  public static async playRewardSound(type: 'xp' | 'gold' | 'item'): Promise<void> {
    const soundName = `${type}_gain`;
    await this.playSound(soundName);
  }

  public static async playAchievementSound(): Promise<void> {
    await this.playSound('achievement');
  }

  public static async playLevelUpSound(): Promise<void> {
    await this.playSound('level_up');
  }

  public static setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  public static isSoundMuted(): boolean {
    return this.isMuted;
  }

  public static async setVolume(volume: number): Promise<void> {
    this.volume = Math.max(0, Math.min(1, volume));
    try {
      await Promise.all(
        Object.values(this.sounds).map(sound => sound.setVolumeAsync(this.volume))
      );
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }

  public static getVolume(): number {
    return this.volume;
  }

  public static getPreloadStatus(): boolean {
    return this.isPreloaded;
  }

  public static async unloadSounds(): Promise<void> {
    try {
      await Promise.all(
        Object.values(this.sounds).map(sound => sound.unloadAsync())
      );
      this.sounds = {};
      this.isPreloaded = false;
    } catch (error) {
      console.error('Error unloading sounds:', error);
    }
  }
} 