// Mock data response for the POST endpoint /api/dailypnl
// Mock API request 
//  Market: US;
//  Account: IB123456789;
//  DateStart: 2025-01-01;
//  DateEnd: 2025-01-25;

export const mockDailyPnl = {
    account: "IB123456789",
    currency: "USD",
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
        { date: "2025-01-25", totalPnl: 1000.30, realizedPnl: 800.30, unrealizedPnl: 200.00 }
    ]
};