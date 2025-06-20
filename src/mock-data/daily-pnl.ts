// Mock data response for the POST endpoint /api/dailypnl
// Mock API request 
//  Market: US;
//  Account: IB123456789;
//  DateStart: 2025-01-01;
//  DateEnd: 2025-01-25;

export const mockData = [
  {
    account: "U1673041",
    dailyPnl: [
      { date: "2025-01-01", totalPnl: 1500.75, realizedPnl: 1200.50, unrealizedPnl: 300.25 },
      { date: "2025-01-02", totalPnl: -500.20, realizedPnl: -600.30, unrealizedPnl: 100.10 },
      { date: "2025-01-03", totalPnl: 800.45, realizedPnl: 700.45, unrealizedPnl: 100.00 },
      { date: "2025-01-04", totalPnl: 2000.00, realizedPnl: 1800.00, unrealizedPnl: 200.00 },
      { date: "2025-01-05", totalPnl: -300.15, realizedPnl: -400.15, unrealizedPnl: 100.00 },
      { date: "2025-01-06", totalPnl: 1200.30, realizedPnl: 1000.30, unrealizedPnl: 200.00 },
      { date: "2025-01-07", totalPnl: -200.50, realizedPnl: -300.50, unrealizedPnl: 100.00 },
      { date: "2025-01-08", totalPnl: 600.75, realizedPnl: 500.75, unrealizedPnl: 100.00 },
      { date: "2025-01-09", totalPnl: 1800.25, realizedPnl: 1600.25, unrealizedPnl: 200.00 },
      { date: "2025-01-10", totalPnl: -400.10, realizedPnl: -500.10, unrealizedPnl: 100.00 },
      { date: "2025-01-11", totalPnl: 900.60, realizedPnl: 800.60, unrealizedPnl: 100.00 },
      { date: "2025-01-12", totalPnl: 2200.00, realizedPnl: 2000.00, unrealizedPnl: 200.00 },
      { date: "2025-01-13", totalPnl: -600.20, realizedPnl: -700.20, unrealizedPnl: 100.00 },
      { date: "2025-01-14", totalPnl: 700.45, realizedPnl: 600.45, unrealizedPnl: 100.00 },
      { date: "2025-01-15", totalPnl: 1600.80, realizedPnl: 1400.80, unrealizedPnl: 200.00 },
      { date: "2025-01-16", totalPnl: -300.15, realizedPnl: -400.15, unrealizedPnl: 100.00 },
      { date: "2025-01-17", totalPnl: 1100.25, realizedPnl: 900.25, unrealizedPnl: 200.00 },
      { date: "2025-01-18", totalPnl: -500.30, realizedPnl: -600.30, unrealizedPnl: 100.00 },
      { date: "2025-01-19", totalPnl: 800.50, realizedPnl: 700.50, unrealizedPnl: 100.00 },
      { date: "2025-01-20", totalPnl: 1900.00, realizedPnl: 1700.00, unrealizedPnl: 200.00 },
      { date: "2025-01-21", totalPnl: -200.10, realizedPnl: -300.10, unrealizedPnl: 100.00 },
      { date: "2025-01-22", totalPnl: 600.75, realizedPnl: 500.75, unrealizedPnl: 100.00 },
      { date: "2025-01-23", totalPnl: 1700.20, realizedPnl: 1500.20, unrealizedPnl: 200.00 },
      { date: "2025-01-24", totalPnl: -400.15, realizedPnl: -500.15, unrealizedPnl: 100.00 },
      { date: "2025-01-25", totalPnl: 1000.30, realizedPnl: 800.30, unrealizedPnl: 200.00 },
    ],
  },
  {
    account: "U1673066",
    dailyPnl: [
      { date: "2025-01-01", totalPnl: 200.50, realizedPnl: 150.50, unrealizedPnl: 50.00 },
      { date: "2025-01-02", totalPnl: -250.10, realizedPnl: -270.10, unrealizedPnl: 20.00 },
      { date: "2025-01-03", totalPnl: -300.20, realizedPnl: -300.20, unrealizedPnl: 0.00 },
      { date: "2025-01-04", totalPnl: 500.00, realizedPnl: 450.00, unrealizedPnl: 50.00 },
      { date: "2025-01-05", totalPnl: -50.15, realizedPnl: -70.15, unrealizedPnl: 20.00 },
      { date: "2025-01-06", totalPnl: 400.30, realizedPnl: 350.30, unrealizedPnl: 50.00 },
      { date: "2025-01-07", totalPnl: 0, realizedPnl: 0, unrealizedPnl: 0 },
      { date: "2025-01-08", totalPnl: 150.75, realizedPnl: 130.75, unrealizedPnl: 20.00 },
      { date: "2025-01-09", totalPnl: 600.25, realizedPnl: 550.25, unrealizedPnl: 50.00 },
      { date: "2025-01-10", totalPnl: -120.10, realizedPnl: -140.10, unrealizedPnl: 20.00 },
      { date: "2025-01-11", totalPnl: 250.60, realizedPnl: 230.60, unrealizedPnl: 20.00 },
      { date: "2025-01-12", totalPnl: 0, realizedPnl: 0, unrealizedPnl: 0 },
      { date: "2025-01-13", totalPnl: -150.20, realizedPnl: -170.20, unrealizedPnl: 20.00 },
      { date: "2025-01-14", totalPnl: 200.45, realizedPnl: 180.45, unrealizedPnl: 20.00 },
      { date: "2025-01-15", totalPnl: 200.80, realizedPnl: 150.80, unrealizedPnl: 50.00 },
      { date: "2025-01-16", totalPnl: -80.15, realizedPnl: -100.15, unrealizedPnl: 20.00 },
      { date: "2025-01-17", totalPnl: 50.25, realizedPnl: 0.25, unrealizedPnl: 50.00 },
      { date: "2025-01-18", totalPnl: -100.30, realizedPnl: -120.30, unrealizedPnl: 20.00 },
      { date: "2025-01-19", totalPnl: 0, realizedPnl: 0, unrealizedPnl: 0 },
      { date: "2025-01-20", totalPnl: 0, realizedPnl: 0, unrealizedPnl: 0 },
      { date: "2025-01-21", totalPnl: -50.10, realizedPnl: -70.10, unrealizedPnl: 20.00 },
      { date: "2025-01-22", totalPnl: 150.75, realizedPnl: 130.75, unrealizedPnl: 20.00 },
      { date: "2025-01-23", totalPnl: -500.20, realizedPnl: -450.20, unrealizedPnl: -50.00 },
      { date: "2025-01-24", totalPnl: -100.15, realizedPnl: -120.15, unrealizedPnl: 20.00 },
      { date: "2025-01-25", totalPnl: 300.30, realizedPnl: 250.30, unrealizedPnl: 50.00 },
    ],
  },
  {
    account: "U2389399",
    dailyPnl: [
      { date: "2025-01-01", totalPnl: 300.75, realizedPnl: 250.50, unrealizedPnl: 50.25 },
      { date: "2025-01-02", totalPnl: -150.20, realizedPnl: -170.30, unrealizedPnl: 20.10 },
      { date: "2025-01-03", totalPnl: 400.45, realizedPnl: 350.45, unrealizedPnl: 50.00 },
      { date: "2025-01-04", totalPnl: 600.00, realizedPnl: 550.00, unrealizedPnl: 50.00 },
      { date: "2025-01-05", totalPnl: -80.15, realizedPnl: -100.15, unrealizedPnl: 20.00 },
      { date: "2025-01-06", totalPnl: 500.30, realizedPnl: 450.30, unrealizedPnl: 50.00 },
      { date: "2025-01-07", totalPnl: -100.50, realizedPnl: -120.50, unrealizedPnl: 20.00 },
      { date: "2025-01-08", totalPnl: 200.75, realizedPnl: 180.75, unrealizedPnl: 20.00 },
      { date: "2025-01-09", totalPnl: 700.25, realizedPnl: 650.25, unrealizedPnl: 50.00 },
      { date: "2025-01-10", totalPnl: -150.10, realizedPnl: -170.10, unrealizedPnl: 20.00 },
      { date: "2025-01-11", totalPnl: 300.60, realizedPnl: 280.60, unrealizedPnl: 20.00 },
      { date: "2025-01-12", totalPnl: 800.00, realizedPnl: 750.00, unrealizedPnl: 50.00 },
      { date: "2025-01-13", totalPnl: -200.20, realizedPnl: -220.20, unrealizedPnl: 20.00 },
      { date: "2025-01-14", totalPnl: 250.45, realizedPnl: 230.45, unrealizedPnl: 20.00 },
      { date: "2025-01-15", totalPnl: 600.80, realizedPnl: 550.80, unrealizedPnl: 50.00 },
      { date: "2025-01-16", totalPnl: -100.15, realizedPnl: -120.15, unrealizedPnl: 20.00 },
      { date: "2025-01-17", totalPnl: 400.25, realizedPnl: 350.25, unrealizedPnl: 50.00 },
      { date: "2025-01-18", totalPnl: -120.30, realizedPnl: -140.30, unrealizedPnl: 20.00 },
      { date: "2025-01-19", totalPnl: 250.50, realizedPnl: 230.50, unrealizedPnl: 20.00 },
      { date: "2025-01-20", totalPnl: 600.00, realizedPnl: 550.00, unrealizedPnl: 50.00 },
      { date: "2025-01-21", totalPnl: -100.10, realizedPnl: -120.10, unrealizedPnl: 20.00 },
      { date: "2025-01-22", totalPnl: 200.75, realizedPnl: 180.75, unrealizedPnl: 20.00 },
      { date: "2025-01-23", totalPnl: 500.20, realizedPnl: 450.20, unrealizedPnl: 50.00 },
      { date: "2025-01-24", totalPnl: -150.15, realizedPnl: -170.15, unrealizedPnl: 20.00 },
      { date: "2025-01-25", totalPnl: 350.30, realizedPnl: 300.30, unrealizedPnl: 50.00 },
    ],
  },
];