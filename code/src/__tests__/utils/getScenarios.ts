import { ScenarioDescription } from 'types/scenario';
import { getScenarios } from 'utils/getScenarios';

describe('getScenarios', () => {
    const mockScenarioUrl = 'https://credo.host.io/central/CentralStackAgent';
    const mockScenarios: ScenarioDescription[] = [
        {
            id: 'abc', name: 'Scenario 1', description: 'Description 1', type: 'Heat Event'
        },
        {
            id: 'def', name: 'Scenario 2', description: 'Description 2', type: 'Flood Event'
        },
    ];

    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('fetches scenarios successfully and returns data', async () => {
        // Mock the fetch response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(mockScenarios),
        });

        const result = await getScenarios(mockScenarioUrl);

        // Assert that fetch was called with the correct URL
        expect(global.fetch).toHaveBeenCalledWith(`${mockScenarioUrl}/getScenarios`, {
            cache: 'no-store',
            credentials: 'same-origin',
        });

        // Assert that the returned data matches the mock data
        expect(result).toEqual(mockScenarios);
    });

    it('handles fetch errors and returns an empty array', async () => {
        // Mock fetch to throw an error
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const result = await getScenarios(mockScenarioUrl);

        // Assert that fetch was called with the correct URL
        expect(global.fetch).toHaveBeenCalledWith(`${mockScenarioUrl}/getScenarios`, {
            cache: 'no-store',
            credentials: 'same-origin',
        });

        // Assert that the function returns an empty array on error
        expect(result).toEqual([]);
    });
});