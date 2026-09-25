/**
 * Imobiliária Meridional - Simulador Financeiro Completo
 * SAC vs. PRICE, Abatimento de FGTS, Custos de ITBI/Escritura e Seguro Fiança Sem Fiador
 */

class MortgageSimulator {
  constructor() {
    this.defaultAnnualRate = 0.098; // 9.8% a.a. média SBPE Caixa
  }

  /**
   * Calcula simulação completa de financiamento
   */
  calculate({ propertyValue, downPayment, fgtsAmount = 0, termMonths = 360, annualRate = 0.098 }) {
    const totalDownPayment = Math.min(propertyValue, downPayment + fgtsAmount);
    const loanAmount = Math.max(0, propertyValue - totalDownPayment);

    if (loanAmount <= 0) {
      return {
        propertyValue,
        downPayment,
        fgtsAmount,
        totalDownPayment,
        loanAmount: 0,
        sac: { firstInstallment: 0, lastInstallment: 0, minIncome: 0, totalPaid: totalDownPayment, totalInterest: 0 },
        price: { installment: 0, minIncome: 0, totalPaid: totalDownPayment, totalInterest: 0 }
      };
    }

    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;

    // 1. Cálculo SAC (Amortização Constante)
    const monthlyAmortization = loanAmount / termMonths;
    const sacFirstMonthInterest = loanAmount * monthlyRate;
    const sacFirstInstallment = monthlyAmortization + sacFirstMonthInterest;
    const sacLastMonthInterest = monthlyAmortization * monthlyRate;
    const sacLastInstallment = monthlyAmortization + sacLastMonthInterest;
    const sacTotalInterest = ((loanAmount * monthlyRate + monthlyAmortization * monthlyRate) / 2) * termMonths;
    const sacTotalPaid = totalDownPayment + loanAmount + sacTotalInterest;
    const sacMinIncome = sacFirstInstallment / 0.30;

    // 2. Cálculo PRICE (Parcelas Fixas)
    const priceFactor = Math.pow(1 + monthlyRate, termMonths);
    const priceInstallment = loanAmount * (monthlyRate * priceFactor) / (priceFactor - 1);
    const priceTotalPaid = totalDownPayment + (priceInstallment * termMonths);
    const priceTotalInterest = Math.max(0, priceTotalPaid - propertyValue);
    const priceMinIncome = priceInstallment / 0.30;

    return {
      propertyValue,
      downPayment,
      fgtsAmount,
      totalDownPayment,
      downPaymentPercent: Math.round((totalDownPayment / propertyValue) * 100),
      loanAmount,
      termMonths,
      termYears: Math.round(termMonths / 12),
      annualRate: (annualRate * 100).toFixed(2),
      sac: {
        firstInstallment: Math.round(sacFirstInstallment),
        lastInstallment: Math.round(sacLastInstallment),
        minIncome: Math.round(sacMinIncome),
        totalPaid: Math.round(sacTotalPaid),
        totalInterest: Math.round(sacTotalInterest)
      },
      price: {
        installment: Math.round(priceInstallment),
        minIncome: Math.round(priceMinIncome),
        totalPaid: Math.round(priceTotalPaid),
        totalInterest: Math.round(priceTotalInterest)
      }
    };
  }

  /**
   * Calcula estimativa de custos de ITBI e Escritura/Registro em Uberaba
   * ITBI Uberaba: ~2.5% | Registro/Escritura: ~1.2%
   */
  calculateClosingCosts(propertyValue) {
    const itbi = propertyValue * 0.025;
    const cartorio = propertyValue * 0.012;
    const total = itbi + cartorio;
    return {
      itbi: Math.round(itbi),
      cartorio: Math.round(cartorio),
      total: Math.round(total)
    };
  }

  /**
   * Calcula estimativa de locação sem fiador (CredPago / Seguro Fiança)
   * Taxa média de 8% a 10% sobre o valor do aluguel
   */
  calculateRentalGuarantee(rentalValue) {
    const monthlyFee = rentalValue * 0.085;
    return {
      monthlyFee: Math.round(monthlyFee),
      totalMonthly: Math.round(rentalValue + monthlyFee)
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
