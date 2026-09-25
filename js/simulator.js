/**
 * Imobiliária Meridional - Simulador de Financiamento Habitacional (Caixa / Bancos)
 * Realiza cálculos dinâmicos de SAC (amortização constante) e PRICE (parcelas fixas),
 * estimativa de primeira parcela, última parcela, e renda familiar mínima exigida.
 */

class MortgageSimulator {
  constructor() {
    this.defaultAnnualRate = 0.098; // 9.8% a.a. média SBPE Caixa
  }

  /**
   * Calcula simulação de financiamento
   * @param {number} propertyValue - Valor do imóvel em Reais
   * @param {number} downPayment - Valor da entrada em Reais
   * @param {number} termMonths - Prazo em meses (ex: 360, 420)
   * @param {number} annualRate - Taxa de juros anual (ex: 0.098 para 9.8%)
   * @param {string} system - 'SAC' ou 'PRICE'
   */
  calculate({ propertyValue, downPayment, termMonths = 360, annualRate = 0.098, system = 'SAC' }) {
    const loanAmount = Math.max(0, propertyValue - downPayment);
    if (loanAmount <= 0) {
      return {
        loanAmount: 0,
        downPayment,
        propertyValue,
        firstInstallment: 0,
        lastInstallment: 0,
        minIncome: 0,
        totalInterest: 0,
        totalPaid: downPayment
      };
    }

    // Taxa mensal proporcional
    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;

    let firstInstallment = 0;
    let lastInstallment = 0;
    let totalPaid = 0;

    if (system === 'SAC') {
      // Sistema de Amortização Constante (parcelas decrescentes)
      const monthlyAmortization = loanAmount / termMonths;
      
      // Primeira parcela: Amortização + Juros sobre o saldo devedor total
      const firstMonthInterest = loanAmount * monthlyRate;
      firstInstallment = monthlyAmortization + firstMonthInterest;

      // Última parcela: Amortização + Juros sobre a última amortização
      const lastMonthInterest = monthlyAmortization * monthlyRate;
      lastInstallment = monthlyAmortization + lastMonthInterest;

      // Total pago no SAC: loanAmount + (soma de PA dos juros)
      const totalInterest = ((loanAmount * monthlyRate + monthlyAmortization * monthlyRate) / 2) * termMonths;
      totalPaid = downPayment + loanAmount + totalInterest;
    } else {
      // Sistema PRICE (parcelas fixas)
      // Pmt = PV * [i * (1+i)^n] / [(1+i)^n - 1]
      const factor = Math.pow(1 + monthlyRate, termMonths);
      firstInstallment = loanAmount * (monthlyRate * factor) / (factor - 1);
      lastInstallment = firstInstallment;
      totalPaid = downPayment + (firstInstallment * termMonths);
    }

    // A parcela não pode comprometer mais de 30% da renda familiar bruta
    const minIncome = firstInstallment / 0.30;
    const totalInterest = Math.max(0, totalPaid - propertyValue);

    return {
      propertyValue,
      downPayment,
      downPaymentPercent: Math.round((downPayment / propertyValue) * 100),
      loanAmount,
      termMonths,
      termYears: Math.round(termMonths / 12),
      annualRate: (annualRate * 100).toFixed(2),
      system,
      firstInstallment: Math.round(firstInstallment),
      lastInstallment: Math.round(lastInstallment),
      minIncome: Math.round(minIncome),
      totalInterest: Math.round(totalInterest),
      totalPaid: Math.round(totalPaid)
    };
  }

  /**
   * Formata número para moeda brasileira (R$)
   */
  static formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value || 0);
  }
}

// Attach to global window
window.MortgageSimulator = MortgageSimulator;
