import { TotalCosts } from '../cost';
import { hideSpinner } from '../logger';
import { printPlainSummary } from './text';

describe('printPlainSummary', () => {
  const mockConsoleClear = jest.spyOn(console, 'clear').mockImplementation();
  const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should print the plain summary correctly', () => {
    const accountAlias = 'testAccount';
    const costs: TotalCosts = {
      totals: {
        lastMonth: 123.45,
        thisMonth: 678.90,
        last7Days: 45.67,
        yesterday: 12.34,
      },
      totalsByService: {
        lastMonth: { service1: 123.45 },
        thisMonth: { service1: 678.90 },
        last7Days: { service1: 45.67 },
        yesterday: { service1: 12.34 },
      },
    };

    printPlainSummary(accountAlias, costs);

    expect(mockConsoleClear).toHaveBeenCalled();
    expect(mockConsoleLog).toHaveBeenNthCalledWith(1, '');
    expect(mockConsoleLog).toHaveBeenNthCalledWith(2, `Account: ${accountAlias}`);
    expect(mockConsoleLog).toHaveBeenNthCalledWith(3, '');
    expect(mockConsoleLog).toHaveBeenNthCalledWith(4, 'Totals:');
    expect(mockConsoleLog).toHaveBeenNthCalledWith(5, `  Last Month: $${costs.totals.lastMonth.toFixed(2)}`);
    expect(mockConsoleLog).toHaveBeenNthCalledWith(6, `  This Month: $${costs.totals.thisMonth.toFixed(2)}`);
    expect(mockConsoleLog).toHaveBeenNthCalledWith(7, `  Last 7 Days: $${costs.totals.last7Days.toFixed(2)}`);
    expect(mockConsoleLog).toHaveBeenNthCalledWith(8, `  Yesterday: $${costs.totals.yesterday.toFixed(2)}`);
  });
});
