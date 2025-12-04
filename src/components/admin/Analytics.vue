<template>
  <div class="analytics-container">
    <div class="mb-8">
      <h3 class="tracking-wider text-2xl mb-1">ANÁLISIS DE DATOS</h3>
      <p class="text-sm opacity-60">Métricas y estadísticas de tu tienda</p>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      <p class="mt-4 opacity-60">Cargando estadísticas...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 p-6 rounded-lg">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <div v-else class="charts-grid">
      <!-- Sales by Month Chart -->
      <div class="chart-card">
        <h4 class="chart-title">Ventas por Mes</h4>
        <div class="chart-wrapper">
          <Line :data="salesChartData" :options="lineChartOptions" />
        </div>
      </div>

      <!-- Top Products Chart -->
      <div class="chart-card">
        <h4 class="chart-title">Productos Más Vendidos</h4>
        <div class="chart-wrapper">
          <Bar :data="topProductsChartData" :options="barChartOptions" />
        </div>
      </div>

      <!-- Orders by Status Chart -->
      <div class="chart-card">
        <h4 class="chart-title">Pedidos por Estado</h4>
        <div class="chart-wrapper">
          <Doughnut :data="ordersStatusChartData" :options="doughnutChartOptions" />
        </div>
      </div>

      <!-- Revenue by Month Chart -->
      <div class="chart-card">
        <h4 class="chart-title">Ingresos Mensuales</h4>
        <div class="chart-wrapper">
          <Bar :data="revenueChartData" :options="revenueBarChartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'vue-chartjs';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const loading = ref(true);
const error = ref(null);
const analyticsData = ref(null);

// API Base URL matching the project's structure
const API_BASE_URL = 'http://localhost/E-commerce Fashion Store Mockup 2/api';

// Fetch analytics data
const fetchAnalytics = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await fetch(`${API_BASE_URL}/analytics.php`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error al cargar los datos');
    }

    const data = await response.json();
    analyticsData.value = data;
  } catch (err) {
    console.error('Error fetching analytics:', err);
    error.value = 'No se pudieron cargar las estadísticas. Verifica la conexión con la base de datos.';
  } finally {
    loading.value = false;
  }
};

// Sales by Month Chart Data
const salesChartData = computed(() => {
  if (!analyticsData.value?.salesByMonth) return { labels: [], datasets: [] };
  
  const months = analyticsData.value.salesByMonth.map(item => item.month);
  const sales = analyticsData.value.salesByMonth.map(item => item.sales);
  
  return {
    labels: months,
    datasets: [
      {
        label: 'Ventas',
        data: sales,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };
});

// Top Products Chart Data
const topProductsChartData = computed(() => {
  if (!analyticsData.value?.topProducts) return { labels: [], datasets: [] };
  
  const names = analyticsData.value.topProducts.map(item => item.name);
  const quantities = analyticsData.value.topProducts.map(item => item.quantity);
  
  return {
    labels: names,
    datasets: [
      {
        label: 'Cantidad Vendida',
        data: quantities,
        backgroundColor: [
          '#f59e0b',
          '#10b981',
          '#6366f1',
          '#ec4899',
          '#8b5cf6'
        ],
        borderColor: '#fff',
        borderWidth: 2
      }
    ]
  };
});

// Orders by Status Chart Data
const ordersStatusChartData = computed(() => {
  if (!analyticsData.value?.ordersByStatus) return { labels: [], datasets: [] };
  
  const statusData = analyticsData.value.ordersByStatus;
  
  return {
    labels: ['Pendiente', 'Entregado', 'Cancelado'],
    datasets: [
      {
        data: [
          statusData.pendiente || 0,
          statusData.entregado || 0,
          statusData.cancelado || 0
        ],
        backgroundColor: [
          '#fbbf24',
          '#10b981',
          '#ef4444'
        ],
        borderColor: '#fff',
        borderWidth: 3
      }
    ]
  };
});

// Revenue by Month Chart Data
const revenueChartData = computed(() => {
  if (!analyticsData.value?.revenueByMonth) return { labels: [], datasets: [] };
  
  const months = analyticsData.value.revenueByMonth.map(item => item.month);
  const revenue = analyticsData.value.revenueByMonth.map(item => item.revenue);
  
  return {
    labels: months,
    datasets: [
      {
        label: 'Ingresos ($)',
        data: revenue,
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  };
});

// Chart Options
const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        font: {
          size: 12,
          family: "'Inter', sans-serif"
        },
        padding: 15,
        usePointStyle: true
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 13
      },
      bodyFont: {
        size: 12
      },
      cornerRadius: 6
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        font: {
          size: 11
        }
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11
        }
      }
    }
  }
};

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 13
      },
      bodyFont: {
        size: 12
      },
      cornerRadius: 6
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        font: {
          size: 11
        }
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11
        }
      }
    }
  }
};

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        font: {
          size: 12,
          family: "'Inter', sans-serif"
        },
        padding: 15,
        usePointStyle: true
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 13
      },
      bodyFont: {
        size: 12
      },
      cornerRadius: 6
    }
  }
};

const revenueBarChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        font: {
          size: 12,
          family: "'Inter', sans-serif"
        },
        padding: 15,
        usePointStyle: true
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 13
      },
      bodyFont: {
        size: 12
      },
      cornerRadius: 6,
      callbacks: {
        label: function(context) {
          return 'Ingresos: $' + context.parsed.y.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        font: {
          size: 11
        },
        callback: function(value) {
          return '$' + value.toLocaleString('es-MX');
        }
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11
        }
      }
    }
  }
};

onMounted(() => {
  fetchAnalytics();
});
</script>

<style scoped>
.analytics-container {
  padding: 0;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
  color: #111827;
}

.chart-wrapper {
  height: 300px;
  position: relative;
}

.tracking-wider {
  letter-spacing: 0.1em;
}

.opacity-60 {
  opacity: 0.6;
}

.text-sm {
  font-size: 0.875rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.text-2xl {
  font-size: 1.5rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.rounded-full {
  border-radius: 9999px;
}

.border-b-2 {
  border-bottom-width: 2px;
}

.border-black {
  border-color: #000;
}

.inline-block {
  display: inline-block;
}

.text-center {
  text-align: center;
}

.py-12 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.mt-4 {
  margin-top: 1rem;
}

.bg-red-50 {
  background-color: #fef2f2;
}

.border-red-200 {
  border-color: #fecaca;
}

.p-6 {
  padding: 1.5rem;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.text-red-800 {
  color: #991b1b;
}
</style>
