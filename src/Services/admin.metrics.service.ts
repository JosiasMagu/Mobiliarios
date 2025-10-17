export type DashboardMetrics = {
  salesToday: number;
  salesWeek: number;
  salesMonth: number;
  kpisDelta: { today: number; week: number; month: number };
  recentOrders: { id: string; customer: string; date: string; status: "Enviado"|"Entregue"|"Processando"; total: number }[];
  bestSellers: { name: string; sales: number }[];
  lowStock: { name: string; qty: number }[];
  performance: { revenueSeries: number[]; visitsSeries: number[] };
};

export async function getAdminDashboard(): Promise<DashboardMetrics> {
  // mock estático
  return {
    salesToday: 2500,
    salesWeek: 12000,
    salesMonth: 45000,
    kpisDelta: { today: 10, week: 5, month: 8 },
    recentOrders: [
      { id: "#12345", customer: "Sofia Almeida",  date: "15/07/2024", status: "Enviado",     total: 150 },
      { id: "#12346", customer: "Lucas Pereira",  date: "14/07/2024", status: "Entregue",    total: 220 },
      { id: "#12347", customer: "Isabela Costa",  date: "13/07/2024", status: "Processando", total: 90  },
      { id: "#12348", customer: "Mateus Oliveira",date: "12/07/2024", status: "Enviado",     total: 300 },
      { id: "#12349", customer: "Carolina Santos",date: "11/07/2024", status: "Entregue",    total: 180 },
    ],
    bestSellers: [
      { name: "Cadeira de Escritório Ergonômica", sales: 120 },
      { name: "Mesa de Jantar Extensível", sales: 80 },
      { name: "Sofá de Canto Modular", sales: 60 },
    ],
    lowStock: [
      { name: "Estante de Livros Moderna", qty: 10 },
      { name: "Luminária de Chão Ajustável", qty: 5 },
    ],
    performance: {
      revenueSeries: [24, 32, 18, 26, 22, 30, 34, 20, 28, 26, 35, 38],
      visitsSeries:  [4, 8, 6, 12, 10, 16, 14, 18, 12, 10, 14, 20],
    },
  };
}
