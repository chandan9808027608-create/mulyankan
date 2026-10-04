export interface BidRecord {
  id: string;
  bikeId: string;
  dealerName: string;
  dealerLocation: string;
  amountNpr: number;
  timestamp: string;
  status: "active" | "accepted" | "outbid" | "inspecting";
  verifiedDealer: boolean;
}

export interface DirectMessage {
  id: string;
  bikeId: string;
  sender: "dealer" | "seller";
  senderName: string;
  message: string;
  timestamp: string;
}

// Initial Kathmandu Valley Dealer Network Bids Simulation
export const INITIAL_BIDS: BidRecord[] = [
  {
    id: "bid-1",
    bikeId: "r15-1",
    dealerName: "Teku Moto Recondition Hub",
    dealerLocation: "Teku, Kathmandu",
    amountNpr: 345000,
    timestamp: "12 mins ago",
    status: "active",
    verifiedDealer: true,
  },
  {
    id: "bid-2",
    bikeId: "r15-1",
    dealerName: "Lalitpur Wheels & Exchange",
    dealerLocation: "Gwarko, Lalitpur",
    amountNpr: 340000,
    timestamp: "35 mins ago",
    status: "outbid",
    verifiedDealer: true,
  },
  {
    id: "bid-3",
    bikeId: "r15-1",
    dealerName: "Bhakapur Auto Zone",
    dealerLocation: "Sallaghari, Bhaktapur",
    amountNpr: 332000,
    timestamp: "1 hour ago",
    status: "outbid",
    verifiedDealer: true,
  },
  {
    id: "bid-4",
    bikeId: "ktm-1",
    dealerName: "Valley Superbikes Recondition",
    dealerLocation: "Naya Bazar, Kathmandu",
    amountNpr: 310000,
    timestamp: "18 mins ago",
    status: "active",
    verifiedDealer: true,
  },
  {
    id: "bid-5",
    bikeId: "re-1",
    dealerName: "Classic Enfield Works Nepal",
    dealerLocation: "Kupondole, Lalitpur",
    amountNpr: 385000,
    timestamp: "5 mins ago",
    status: "active",
    verifiedDealer: true,
  },
];

// Initial Messages Simulation
export const INITIAL_MESSAGES: DirectMessage[] = [
  {
    id: "msg-1",
    bikeId: "r15-1",
    sender: "dealer",
    senderName: "Teku Moto Recondition Hub",
    message: "Namaste Prashant ji! Bluebook original 1st hand ra tax 2082 clear bhaye cash NPR 3,45,000 ready chha. Can we do spot inspection today after 4 PM?",
    timestamp: "10 mins ago",
  },
  {
    id: "msg-2",
    bikeId: "r15-1",
    sender: "seller",
    senderName: "Prashant Shrestha",
    message: "Namaste! Yes, bluebook in hand ready and tax is 100% cleared. Eyeplex mall pachadi aunu hola.",
    timestamp: "6 mins ago",
  },
];
