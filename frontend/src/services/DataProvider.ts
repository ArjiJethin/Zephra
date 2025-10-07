// Realistic Mock Data Service for Backend Switching
export interface MockAirQualityData {
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  location: string;
  timestamp: string;
  status: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
}

export interface MockWeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  windDirection: string;
}

class DataProvider {
  private static instance: DataProvider;
  private currentLocation: string = 'New York';

  public static getInstance(): DataProvider {
    if (!DataProvider.instance) {
      DataProvider.instance = new DataProvider();
    }
    return DataProvider.instance;
  }

  private generateRealisticAQI(): number {
    // Generate realistic AQI values with seasonal and daily variations
    const hour = new Date().getHours();
    const baseAQI = 45 + Math.random() * 80; // Base range 45-125
    
    // Add daily pattern (worse in morning/evening due to traffic)
    const dailyFactor = hour < 8 || hour > 17 ? 1.2 : hour > 10 && hour < 16 ? 0.8 : 1.0;
    
    return Math.max(0, Math.min(500, Math.round(baseAQI * dailyFactor)));
  }

  private generatePollutantValue(aqi: number, pollutant: string): number {
    const aqiRatio = aqi / 100;
    const baseValues = {
      pm25: 12 * aqiRatio + Math.random() * 15,
      pm10: 25 * aqiRatio + Math.random() * 20,
      o3: 70 * aqiRatio + Math.random() * 30,
      no2: 40 * aqiRatio + Math.random() * 25,
      so2: 20 * aqiRatio + Math.random() * 15,
      co: 1000 * aqiRatio + Math.random() * 500
    };
    
    return Math.max(0, Math.round(baseValues[pollutant as keyof typeof baseValues] || 0));
  }

  private getAQIStatus(aqi: number): MockAirQualityData['status'] {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }

  public async getDashboardData(location?: string): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    const currentLoc = location || this.currentLocation;
    const aqi = this.generateRealisticAQI();
    
    // Generate comprehensive dashboard data
    const now = new Date();
    const mockData = {
      success: true,
      location_info: {
        name: currentLoc,
        country: 'United States',
        timezone: 'America/New_York',
        local_time: now.toISOString()
      },
      
      // Air quality data (24 hours)
      air_quality: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(now.getTime() - (23 - i) * 60 * 60 * 1000).toISOString(),
        aqi: this.generateRealisticAQI(),
        pm25: this.generatePollutantValue(aqi, 'pm25'),
        pm10: this.generatePollutantValue(aqi, 'pm10'),
        o3: this.generatePollutantValue(aqi, 'o3'),
        no2: this.generatePollutantValue(aqi, 'no2'),
        so2: this.generatePollutantValue(aqi, 'so2'),
        co: this.generatePollutantValue(aqi, 'co')
      })),
      
      // Weather data (24 hours)
      weather: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(now.getTime() - (23 - i) * 60 * 60 * 1000).toISOString(),
        temperature: Math.round(15 + Math.random() * 20 + Math.sin(i / 4) * 5),
        humidity: Math.round(40 + Math.random() * 40),
        windSpeed: Math.round(5 + Math.random() * 15),
        pressure: Math.round(1000 + Math.random() * 50),
        visibility: Math.round(8 + Math.random() * 7),
        windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)]
      })),
      
      // Satellite data (24 hours)
      satellite: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(now.getTime() - (23 - i) * 60 * 60 * 1000).toISOString(),
        aerosol_optical_depth: Math.round((0.1 + Math.random() * 0.5) * 1000) / 1000,
        cloud_cover: Math.round(Math.random() * 100),
        surface_reflectance: Math.round((0.1 + Math.random() * 0.3) * 1000) / 1000,
        visibility: Math.round(8 + Math.random() * 7),
        uv_index: Math.round(1 + Math.random() * 10)
      })),
      
      // Health data (24 hours)
      health: Array.from({ length: 24 }, (_, i) => {
        const hourAqi = this.generateRealisticAQI();
        // Generate health indices based on AQI (scale 0-10)
        const overallHealth = Math.max(0, Math.min(10, 10 - (hourAqi / 50) * 2));
        const respiratoryRisk = Math.max(0, Math.min(10, (hourAqi / 30) * 2));
        const cardiovascularRisk = Math.max(0, Math.min(10, (hourAqi / 40) * 2.5));
        
        return {
          timestamp: new Date(now.getTime() - (23 - i) * 60 * 60 * 1000).toISOString(),
          overall_health_index: Math.round(overallHealth * 10) / 10,
          respiratory_risk: Math.round(respiratoryRisk * 10) / 10,
          cardiovascular_risk: Math.round(cardiovascularRisk * 10) / 10,
          health_index: hourAqi,
          risk_level: hourAqi <= 50 ? 'Low' : hourAqi <= 100 ? 'Moderate' : hourAqi <= 150 ? 'Unhealthy for Sensitive Groups' : hourAqi <= 200 ? 'Unhealthy' : 'Very Unhealthy',
          recommendations: hourAqi <= 50 ? 'Air quality is good for outdoor activities' : 'Consider limiting outdoor activities',
          vulnerable_groups: hourAqi > 100 ? ['Children', 'Elderly', 'People with respiratory conditions'] : []
        };
      }),
      
      // Forecast data (next 7 days)
      forecast: Array.from({ length: 7 }, (_, i) => ({
        hour: `Day ${i + 1}`,
        predicted_aqi: this.generateRealisticAQI(),
        confidence: Math.round(70 + Math.random() * 25)
      })),
      
      // Status data
      status: {
        api_status: 'Mock Data Active',
        data_freshness: 100,
        last_update: now.toISOString()
      },
      
      timestamp: now.toISOString()
    };

    console.log('🎭 Generated comprehensive dashboard mock data:', mockData);
    return mockData;
  }

  public setLocation(location: string): void {
    this.currentLocation = location;
  }
}

export default DataProvider;