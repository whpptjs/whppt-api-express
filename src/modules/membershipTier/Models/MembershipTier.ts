export type MembershipDiscount = {
  appliedTo: 'total' | 'shipping';
  type: 'percentage' | 'flat';
  value: number;
  shipping?: {
    constraint?: string;
    value?: string;
    text?: string;
  };
  _id: string;
  minItemsRequiredForDiscount?: number;
};

export type MembershipTier = {
  _id: string;
  name: string;
  discounts: MembershipDiscount[];
  level: number;
  entryLevelSpend: number;
  messageToMembers: {
    _id: string;
    message: string;
    link: {
      _id?: string;
      type: 'file' | 'anchor' | 'page' | 'external';
      text: any;
      href: any;
    };
  };
};

export type MembershipOptions = {
  _id: string;
  membershipTiers: MembershipTier[];
};
