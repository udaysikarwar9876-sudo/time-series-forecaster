/**
 * Least Squares Regression Utilities
 */

/**
 * Simple linear regression using least squares: y = a + bx
 */
export function simpleLinearRegression(x: number[], y: number[]): { a: number; b: number } {
  const n = x.length;
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);

  const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const a = (sumY - b * sumX) / n;

  return { a, b };
}

/**
 * Multiple linear regression using least squares: y = b0 + b1*x1 + b2*x2 + ... + bn*xn
 * Uses matrix operations (normal equations): β = (X^T X)^-1 X^T y
 */
export function multipleLinearRegression(X: number[][], y: number[]): number[] {
  const n = X.length;
  const m = X[0].length;

  // Add column of ones for intercept
  const XWithIntercept = X.map(row => [1, ...row]);

  // Calculate X^T X
  const XTX: number[][] = [];
  for (let i = 0; i < m + 1; i++) {
    XTX[i] = [];
    for (let j = 0; j < m + 1; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += XWithIntercept[k][i] * XWithIntercept[k][j];
      }
      XTX[i][j] = sum;
    }
  }

  // Calculate X^T y
  const XTy: number[] = [];
  for (let i = 0; i < m + 1; i++) {
    let sum = 0;
    for (let k = 0; k < n; k++) {
      sum += XWithIntercept[k][i] * y[k];
    }
    XTy[i] = sum;
  }

  // Solve (X^T X) β = X^T y using Gaussian elimination
  const coefficients = gaussianElimination(XTX, XTy);
  return coefficients;
}

/**
 * Polynomial regression using least squares: y = a0 + a1*x + a2*x^2 + ... + an*x^n
 */
export function polynomialRegression(x: number[], y: number[], degree: number): number[] {
  // Transform x into polynomial features
  const X = x.map(val => {
    const row: number[] = [];
    for (let i = 1; i <= degree; i++) {
      row.push(Math.pow(val, i));
    }
    return row;
  });

  return multipleLinearRegression(X, y);
}

/**
 * Gaussian elimination for solving system of linear equations Ax = b
 */
function gaussianElimination(A: number[][], b: number[]): number[] {
  const n = A.length;
  const augmented: number[][] = A.map((row, i) => [...row, b[i]]);

  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

    // Make all rows below this one 0 in current column
    for (let k = i + 1; k < n; k++) {
      const factor = augmented[k][i] / augmented[i][i];
      for (let j = i; j < n + 1; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }

  // Back substitution
  const x: number[] = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = augmented[i][n];
    for (let j = i + 1; j < n; j++) {
      x[i] -= augmented[i][j] * x[j];
    }
    x[i] /= augmented[i][i];
  }

  return x;
}

/**
 * Calculate R-squared (coefficient of determination)
 */
export function calculateRSquared(observed: number[], predicted: number[]): number {
  const mean = observed.reduce((sum, val) => sum + val, 0) / observed.length;
  const totalSS = observed.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
  const residualSS = observed.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0);
  return 1 - residualSS / totalSS;
}
