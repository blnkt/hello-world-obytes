/**
 * Hints and Guidance
 * Provides helpful hints and guidance for players
 */

export type GuidanceContext =
  | 'low_energy'
  | 'deep_dive'
  | 'collection'
  | 'critical'
  | 'casual'
  | 'tutorial'
  | 'advanced'
  | 'risk_assessment';

export type GuidanceCategory = 'beginner' | 'intermediate' | 'advanced';

export interface HintData {
  hint: string;
  relevance: number;
}

export interface GuidanceMessage {
  message: string;
  category: GuidanceCategory;
}

interface HintParams {
  context: GuidanceContext;
  energyLevel?: number;
  depth?: number;
  completionRate?: number;
  urgency?: number;
}

interface GuidanceParams {
  context: GuidanceContext;
  playerLevel?: number;
  completionRate?: number;
  energyLevel?: number;
  returnCost?: number;
}

export class HintsGuidance {
  getContextualHint(params: HintParams): HintData {
    const hint = this.generateHint(params.context, params);
    const relevance = this.calculateRelevance(params);

    return { hint, relevance };
  }

  getGuidanceMessage(params: GuidanceParams): GuidanceMessage {
    const message = this.generateGuidanceMessage(params);
    const category = this.determineCategory(params);

    return { message, category };
  }

  private generateHint(context: GuidanceContext, params: HintParams): string {
    const hints: Record<GuidanceContext, string> = {
      low_energy: `Energy running low! Consider returning to the surface soon or finding a shortcut to save energy.`,
      deep_dive: `You're getting deep. Be extra careful with energy management - the return journey costs more energy at greater depths.`,
      collection: `Continue exploring to find more collection items. Each completed set provides permanent bonuses!`,
      critical: `Critical situation! Immediate retreat recommended. Better to live and collect another day than to lose everything.`,
      casual: `Take your time and explore safely.`,
      tutorial: `Welcome! Start by exploring shallow depths to get familiar with the system.`,
      advanced: `Master-level tips: optimize your path, use shortcuts wisely, and time your cash-outs for maximum efficiency.`,
      risk_assessment: `Assess your energy carefully. Push-your-luck mechanics can be rewarding but dangerous.`,
    };

    return hints[context] || 'Keep exploring and learning!';
  }

  private calculateRelevance(params: HintParams): number {
    const urgency = params.urgency || 0.5;
    const isCritical = params.context === 'critical';
    const isLowEnergy =
      params.context === 'low_energy' && (params.energyLevel || 100) < 30;

    let relevance = 0.5;

    if (isCritical) {
      relevance = 1.0;
    } else if (isLowEnergy) {
      relevance = 0.8;
    } else {
      relevance = urgency;
    }

    return relevance;
  }

  private generateGuidanceMessage(params: GuidanceParams): string {
    const messages: Record<GuidanceContext, string> = {
      low_energy:
        'Monitor your energy carefully. Consider your return costs before proceeding.',
      deep_dive:
        'Deep dives require careful planning. The exponential return cost curve means each step deeper dramatically increases your risk.',
      collection:
        'Collections provide permanent bonuses! Focus on completing sets for powerful upgrades.',
      critical: 'Emergency protocol: Prioritize safe return over continuing.',
      casual: 'Enjoy exploring the depths at your own pace.',
      tutorial:
        'Start shallow, learn the mechanics, then push deeper as you gain confidence.',
      advanced:
        'Time your deep dives with your highest daily energy. Shortcuts discovered provide permanent return cost reductions.',
      risk_assessment:
        'Before proceeding: Can you afford the return? Leave yourself a safety margin of at least 20%.',
    };

    return messages[params.context] || 'Keep exploring!';
  }

  private determineCategory(params: GuidanceParams): GuidanceCategory {
    if (params.playerLevel && params.playerLevel < 10) {
      return 'beginner';
    } else if (params.playerLevel && params.playerLevel >= 50) {
      return 'advanced';
    } else {
      return 'intermediate';
    }
  }
}
