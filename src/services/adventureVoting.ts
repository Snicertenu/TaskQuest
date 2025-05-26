import { Adventure, PartyMember } from '../types';
import { firestore } from '../config/firebase';

interface AdventureProposal {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  proposedBy: string;
  timestamp: Date;
  votes: {
    [memberId: string]: {
      timestamp: Date;
      vote: 'yes' | 'no';
    };
  };
  status: 'proposed' | 'approved' | 'rejected';
  startDate?: Date;
  endDate?: Date;
}

export class AdventureVoting {
  private static readonly VOTING_PERIOD_DAYS = 7;
  private static readonly MIN_APPROVAL_PERCENTAGE = 0.6; // 60% approval required

  public static async proposeAdventure(
    partyId: string,
    proposal: Omit<AdventureProposal, 'id' | 'votes' | 'status'>
  ): Promise<AdventureProposal> {
    const proposalRef = firestore()
      .collection('parties')
      .doc(partyId)
      .collection('adventureProposals')
      .doc();

    const newProposal: AdventureProposal = {
      id: proposalRef.id,
      ...proposal,
      votes: {},
      status: 'proposed',
    };

    await proposalRef.set(newProposal);
    return newProposal;
  }

  public static async voteOnProposal(
    partyId: string,
    proposalId: string,
    memberId: string,
    vote: 'yes' | 'no'
  ): Promise<void> {
    const proposalRef = firestore()
      .collection('parties')
      .doc(partyId)
      .collection('adventureProposals')
      .doc(proposalId);

    await proposalRef.update({
      [`votes.${memberId}`]: {
        timestamp: firestore.FieldValue.serverTimestamp(),
        vote,
      },
    });

    // Check if voting period is over and update status
    await this.checkAndUpdateProposalStatus(partyId, proposalId);
  }

  private static async checkAndUpdateProposalStatus(
    partyId: string,
    proposalId: string
  ): Promise<void> {
    const proposalRef = firestore()
      .collection('parties')
      .doc(partyId)
      .collection('adventureProposals')
      .doc(proposalId);

    const proposalDoc = await proposalRef.get();
    const proposal = proposalDoc.data() as AdventureProposal;

    if (proposal.status !== 'proposed') {
      return;
    }

    const votingPeriodEnd = new Date(proposal.timestamp);
    votingPeriodEnd.setDate(votingPeriodEnd.getDate() + this.VOTING_PERIOD_DAYS);

    if (new Date() >= votingPeriodEnd) {
      const votes = Object.values(proposal.votes);
      const totalVotes = votes.length;
      const yesVotes = votes.filter(v => v.vote === 'yes').length;
      const approvalPercentage = yesVotes / totalVotes;

      let status: 'approved' | 'rejected';
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (approvalPercentage >= this.MIN_APPROVAL_PERCENTAGE) {
        status = 'approved';
        startDate = new Date();
        endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // One month duration
      } else {
        status = 'rejected';
      }

      await proposalRef.update({
        status,
        startDate,
        endDate,
      });

      if (status === 'approved') {
        await this.createAdventureFromProposal(partyId, proposal);
      }
    }
  }

  private static async createAdventureFromProposal(
    partyId: string,
    proposal: AdventureProposal
  ): Promise<void> {
    const adventure: Adventure = {
      id: proposal.id,
      title: proposal.title,
      description: proposal.description,
      difficulty: proposal.difficulty,
      startDate: proposal.startDate!,
      endDate: proposal.endDate!,
      dailyEncounter: {
        id: `${proposal.id}_daily`,
        title: 'Daily Tasks',
        description: 'Complete daily tasks to progress',
        difficulty: proposal.difficulty,
        progress: 0,
        requiredProgress: 30,
        rewards: {
          gold: 50,
          xp: 100,
          itemChance: 0.1,
        },
      },
      weeklyMiniBoss: {
        id: `${proposal.id}_weekly`,
        title: 'Weekly Challenge',
        description: 'Complete weekly challenges to progress',
        difficulty: proposal.difficulty,
        progress: 0,
        requiredProgress: 4,
        rewards: {
          gold: 200,
          xp: 400,
          itemChance: 0.3,
        },
      },
      monthlyBoss: {
        id: `${proposal.id}_monthly`,
        title: 'Monthly Goal',
        description: 'Complete the monthly goal to finish the adventure',
        difficulty: proposal.difficulty,
        progress: 0,
        requiredProgress: 1,
        rewards: {
          gold: 500,
          xp: 1000,
          itemChance: 0.5,
        },
      },
      rewards: {
        gold: 1000,
        xp: 2000,
        items: [],
      },
    };

    await firestore()
      .collection('parties')
      .doc(partyId)
      .collection('adventures')
      .doc(proposal.id)
      .set(adventure);
  }

  public static async getActiveProposals(partyId: string): Promise<AdventureProposal[]> {
    const proposalsSnapshot = await firestore()
      .collection('parties')
      .doc(partyId)
      .collection('adventureProposals')
      .where('status', '==', 'proposed')
      .get();

    return proposalsSnapshot.docs.map(doc => doc.data() as AdventureProposal);
  }

  public static async getVotingResults(
    partyId: string,
    proposalId: string
  ): Promise<{ yes: number; no: number; total: number }> {
    const proposalDoc = await firestore()
      .collection('parties')
      .doc(partyId)
      .collection('adventureProposals')
      .doc(proposalId)
      .get();

    const proposal = proposalDoc.data() as AdventureProposal;
    const votes = Object.values(proposal.votes);
    const yesVotes = votes.filter(v => v.vote === 'yes').length;
    const noVotes = votes.filter(v => v.vote === 'no').length;

    return {
      yes: yesVotes,
      no: noVotes,
      total: votes.length,
    };
  }
} 