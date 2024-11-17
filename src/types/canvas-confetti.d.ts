declare module "canvas-confetti" {
	interface ConfettiConfig {
		particleCount?: number;
		spread?: number;
		origin?: {
			x: number;
			y: number;
		};
		colors?: string[];
		startVelocity?: number;
		gravity?: number;
		scalar?: number;
	}

	function confetti(config: ConfettiConfig): Promise<void>;
	export default confetti;
}
