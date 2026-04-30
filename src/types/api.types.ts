/**
 * apiTypes.ts
 * Shared API response / entity interfaces.
 * Mirrors the shapes from the main user app's apiService.ts.
 */

export interface EventData {
  eventId: string;
  startDate: string;
  endDate: string;
  time?: string;
  location: string;
  name: string;
  details: string;
  description: string;
  rewards: string;
  joinsCount: number;
  participants: string[];
  eventImage?: string | null;
  eventType?: "public" | "private";
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  age?: number;
  gender?: string;
  joinedEvents?: string[];
  group?: {
    groupId: string;
    groupName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EventLog {
  id: string;
  eventId: string;
  userId: string;
  groupId: number | null;
  checkInTime: string;
  checkOutTime: string | null;
  totalHours: number;
  garbageWeight: number;
  garbageType: string;
  eventLocation?: string;
  wasteImage?: string;
  createdAt: string;
  updatedAt: string;
  event: {
    eventId: string;
    name: string;
    location: string;
    date: string;
  };
  group: {
    groupId: string;
    groupName: string;
  } | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userEmail: string;
  totalHours: number;
  garbageWeightCollected: number;
  checkInTime: string;
  checkOutTime: string;
  eventName: string;
  eventDate: string;
}

export interface OrganizationProfile {
  orgId?: string;
  orgName: string;
  name: string;
  email: string;
  password: string;
  address?: string;
  phone?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface OrganizationDashboard {
  message: string;
  profile: OrganizationProfile;
  stats: {
    totalPoints: number;
    totalMinutesLogged: number;
    totalWeight: number;
  };
  eventsJoined: {
    eventId: string;
    eventName: string;
    location: string;
    eventStartDate: string;
    eventEndDate: string;
    joinedCount: number;
    eventImage: string | null;
  }[];
  events: {
    public: any[];
    private: any[];
  };
  usersJoined: {
    userId: string;
    name: string;
    email: string;
  }[];
}

export interface FullUserProfile extends UserProfile {
  totalWasteCollected: number;
  totalTimeLogged: number;
  co2Collected: number;
  eventsJoinedCount: number;
  groupsJoinedCount: number;
  totalPoints: number;
  overallBadge: string | null;
  completedActivities: number;
}
