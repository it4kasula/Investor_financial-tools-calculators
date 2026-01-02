import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';

const CompoundInterestCalculator = () => {
  const [initial, setInitial] = useState(10000);
  const [monthly, setMonthly] = useState(500);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(7);
  const [variance, setVariance] = useState(2);
  const [frequency, setFrequency] = useState('Monthly');

  const frequencies = {
    'Annually': 1,
    'Semiannually': 2,
    'Quarterly': 4,
    'Monthly': 12,
    'Daily': 365
  };

  const calculateCompound = (p, pmt, r, n, t) => {
    const rDecimal = r / 100;
    const totalPeriods = n * t;
    
    // Future value with regular contributions
    const fv = p * Math.pow(1 + rDecimal/n, totalPeriods) + 
               pmt * (Math.pow(1 + rDecimal/n, totalPeriods) - 1) / (rDecimal/n);
    
    const totalContributions = p + (pmt * 12 * t);
    const totalInterest = fv - totalContributions;
    
    return { fv, totalContributions, totalInterest };
  };

  const generateYearlyData = (p, pmt, r, n, t) => {
    const data = [];
    const rDecimal = r / 100;
    
    for (let year = 0; year <= t; year++) {
      const periods = n * year;
      const balance = periods === 0 ? p : 
        p * Math.pow(1 + rDecimal/n, periods) + 
        pmt * (Math.pow(1 + rDecimal/n, periods) - 1) / (rDecimal/n);
      
      const contributions = p + (pmt * 12 * year);
      const interest = balance - contributions;
      
      data.push({
        year,
        balance: Math.round(balance),
        contributions: Math.round(contributions),
        interest: Math.round(interest)
      });
    }
    return data;
  };

  const mainResult = useMemo(() => 
    calculateCompound(initial, monthly, rate, frequencies[frequency], years),
    [initial, monthly, rate, frequency, years]
  );

  const chartData = useMemo(() => 
    generateYearlyData(initial, monthly, rate, frequencies[frequency], years),
    [initial, monthly, rate, frequency, years]
  );

  const varianceResults = useMemo(() => {
    const results = [];
    for (let i = -variance; i <= variance; i += 0.5) {
      const testRate = rate + i;
      if (testRate >= 0) {
        const result = calculateCompound(initial, monthly, testRate, frequencies[frequency], years);
        results.push({
          rate: testRate,
          ...result
        });
      }
    }
    return results;
  }, [initial, monthly, rate, variance, frequency, years]);

  const downloadExcel = () => {
    let csv = 'COMPOUND INTEREST CALCULATOR\n\n';
    csv += 'INPUT PARAMETERS\n';
    csv += `Initial Investment,$${initial.toLocaleString()}\n`;
    csv += `Monthly Contribution,$${monthly.toLocaleString()}\n`;
    csv += `Length of Time,${years} years\n`;
    csv += `Interest Rate,${rate}%\n`;
    csv += `Compound Frequency,${frequency}\n\n`;
    
    csv += 'MAIN RESULTS\n';
    csv += `Future Value,$${Math.round(mainResult.fv).toLocaleString()}\n`;
    csv += `Total Contributions,$${Math.round(mainResult.totalContributions).toLocaleString()}\n`;
    csv += `Total Interest Earned,$${Math.round(mainResult.totalInterest).toLocaleString()}\n\n`;
    
    csv += 'YEAR-BY-YEAR BREAKDOWN\n';
    csv += 'Year,Balance,Contributions,Interest\n';
    chartData.forEach(row => {
      csv += `${row.year},$${row.balance.toLocaleString()},$${row.contributions.toLocaleString()},$${row.interest.toLocaleString()}\n`;
    });
    
    csv += '\nINTEREST RATE VARIANCE ANALYSIS\n';
    csv += 'Rate,Future Value,Total Interest\n';
    varianceResults.forEach(row => {
      csv += `${row.rate.toFixed(1)}%,$${Math.round(row.fv).toLocaleString()},$${Math.round(row.totalInterest).toLocaleString()}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compound_interest_calculator.csv';
    a.click();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Compound Interest Calculator</h1>
              <p className="text-gray-600 mt-2">Determine how much your money can grow using the power of compound interest</p>
            </div>
            <button
              onClick={downloadExcel}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <Download size={20} />
              Export to CSV
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Step 1: Initial Investment</h2>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Investment *
                </label>
                <input
                  type="number"
                  value={initial}
                  onChange={(e) => setInitial(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Amount available to invest initially</p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Step 2: Contribute</h2>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Contribution *
                </label>
                <input
                  type="number"
                  value={monthly}
                  onChange={(e) => setMonthly(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4"
                />
                <p className="text-xs text-gray-500 mb-4">Amount to add each month</p>
                
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Length of Time in Years *
                </label>
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Step 3: Interest Rate</h2>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Interest Rate (%) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                />
                
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interest Rate Variance Range (±%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={variance}
                  onChange={(e) => setVariance(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="bg-orange-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Step 4: Compound It</h2>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compound Frequency *
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {Object.keys(frequencies).map(freq => (
                    <option key={freq} value={freq}>{freq}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Your Results</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-blue-400 pb-2">
                    <span className="text-blue-100">Future Value:</span>
                    <span className="text-2xl font-bold">{formatCurrency(mainResult.fv)}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-blue-400 pb-2">
                    <span className="text-blue-100">Total Contributions:</span>
                    <span className="text-xl font-semibold">{formatCurrency(mainResult.totalContributions)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Total Interest Earned:</span>
                    <span className="text-xl font-semibold text-green-300">{formatCurrency(mainResult.totalInterest)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Growth Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                    <YAxis tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="balance" stroke="#3B82F6" strokeWidth={3} name="Total Balance" />
                    <Line type="monotone" dataKey="contributions" stroke="#10B981" strokeWidth={2} name="Contributions" />
                    <Line type="monotone" dataKey="interest" stroke="#8B5CF6" strokeWidth={2} name="Interest" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Interest Rate Variance Analysis</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left">Rate</th>
                        <th className="px-4 py-2 text-right">Future Value</th>
                        <th className="px-4 py-2 text-right">Interest</th>
                      </tr>
                    </thead>
                    <tbody>
                      {varianceResults.map((result, idx) => (
                        <tr key={idx} className={result.rate === rate ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-50'}>
                          <td className="px-4 py-2">{result.rate.toFixed(1)}%</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(result.fv)}</td>
                          <td className="px-4 py-2 text-right text-green-600">{formatCurrency(result.totalInterest)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompoundInterestCalculator;