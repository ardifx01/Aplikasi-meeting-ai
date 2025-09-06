export enum Page {
  Login,
  Register,
  Dashboard,
  MeetingRooms,
  RoomDetail,
  EditRoom,
  AddRoom,
  Booking,
  AiAssistant,
  BookingConfirmation,
  Reservations,
  ReservationDetail,
  History,
  Profile,
  Settings,
  HelpCenter,
}

export interface MeetingRoom {
  id: number;
  name: string;
  floor: string;
  capacity: number;
  address: string;
  facilities: string[];
  image: string;
}

export interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  quickActions?: QuickAction[];
}

export interface QuickAction {
  label: string;
  icon?: any; // Made optional and used any type to avoid React dependency
  action: () => void;
}

export interface Booking {
  id: string | number;
  roomName: string;
  roomId: number;
  topic: string;
  date: string;
  time: string;
  participants: number;
  pic: string;
  meetingType: 'internal' | 'external';
  foodOrder: 'berat' | 'ringan' | 'tidak';
  imageUrl?: string;
}

export enum BookingState {
  IDLE,
  ASKING_ROOM,
  ASKING_TOPIC,
  ASKING_PIC,
  ASKING_PARTICIPANTS,
  ASKING_DATE,
  ASKING_TIME,
  ASKING_MEETING_TYPE,
  ASKING_FOOD_TYPE,
  CONFIRMING,
  BOOKED,
  // New states for modifying existing data
  MODIFYING_ROOM,
  MODIFYING_TOPIC,
  MODIFYING_PIC,
  MODIFYING_PARTICIPANTS,
  MODIFYING_DATE,
  MODIFYING_TIME,
  MODIFYING_MEETING_TYPE,
  MODIFYING_FOOD_TYPE,
}

export interface User {
  fullName?: string;
  email?: string;
  role?: string;
  avatar?: string;
}
