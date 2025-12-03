/**
 * Main Dashboard Controller
 * Handles all dashboard interactions and data visualization
 * Now uses API endpoints instead of direct CSV loading
 */

class Dashboard {
    constructor() {
        this.currentYear = 2023;
        this.currentView = 'overview';
        this.currentFilter = null;
        this.compareMode = 'baseline'; // 'baseline' or 'previous'
        this.apiBaseUrl = 'http://localhost:8001/api'; // Backend API URL
        
        this.charts = {
            hero: null,
            miniBar: null,
            progress: null
        };

        this.init();
    }

    async init() {
        console.log('Dashboard.init() called');
        console.log('API Base URL:', this.apiBaseUrl);
        
        // Setup event listeners FIRST, before any async operations
        this.setupEventListeners();
        
        // Check backend connection first
        const connected = await this.checkBackendConnection();
        if (!connected) {
            console.error('Backend not connected!');
            return;
        }
        
        // Initial render
        console.log('Loading initial dashboard data...');
        await this.updateDashboard();
        console.log('✓ Dashboard initialized successfully');
    }
    
    // API helper methods
    async fetchAPI(endpoint) {
        try {
            const url = `${this.apiBaseUrl}${endpoint}`;
            console.log(`Fetching: ${url}`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API error ${response.status}:`, errorText);
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`✓ Successfully fetched ${endpoint}:`, data);
            return data;
        } catch (error) {
            console.error(`✗ Error fetching ${endpoint}:`, error);
            
            // Only show connection error if it's a network error
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                this.showConnectionError();
            }
            
            throw error;
        }
    }
    
    async checkBackendConnection() {
        try {
            console.log('Checking backend connection...');
            const url = `${this.apiBaseUrl}/summary/us?year=2023`;
            console.log('Testing URL:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✓ Backend connected!', data);
                // Hide error banner if it exists
                const banner = document.getElementById('connection-error');
                if (banner) banner.style.display = 'none';
                return true;
            } else {
                console.error('✗ Backend responded with error:', response.status, response.statusText);
                this.showConnectionError();
                return false;
            }
        } catch (error) {
            console.error('✗ Backend connection check failed:', error);
            console.error('Error details:', error.message);
            this.showConnectionError();
            return false;
        }
    }
    
    showConnectionError() {
        // Show error banner if not already shown
        if (document.getElementById('connection-error')) return;
        
        const errorBanner = document.createElement('div');
        errorBanner.id = 'connection-error';
        errorBanner.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #FF4D73;
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(255, 77, 115, 0.3);
            z-index: 10000;
            font-family: 'Neue Haas Grotesk', sans-serif;
            font-size: 14px;
            max-width: 400px;
        `;
        errorBanner.innerHTML = `
            <strong>⚠️ Backend Not Connected</strong><br>
            <small>Start backend: <code>cd backend && python main.py</code></small>
        `;
        document.body.appendChild(errorBanner);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (errorBanner.parentNode) {
                errorBanner.parentNode.removeChild(errorBanner);
            }
        }, 10000);
    }

    setupEventListeners() {
        // View pills
        document.querySelectorAll('.view-pill').forEach(pill => {
            pill.addEventListener('click', async (e) => {
                document.querySelectorAll('.view-pill').forEach(p => p.classList.remove('active'));
                e.target.classList.add('active');
                this.currentView = e.target.dataset.view;
                await this.updateDashboard();
            });
        });

        // Toggle options
        document.querySelectorAll('.toggle-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.toggle-option').forEach(o => o.classList.remove('active'));
                e.target.classList.add('active');
                this.compareMode = e.target.dataset.compare;
                this.updateDashboard();
            });
        });

        // Nav items now handle filters - use direct event binding
        const navItems = document.querySelectorAll('.nav-item');
        console.log('Found nav items:', navItems.length);
        
        if (navItems.length === 0) {
            console.warn('No nav items found! Check HTML structure.');
        }
        
        navItems.forEach((item, index) => {
            const view = item.dataset.view;
            const filter = item.dataset.filter;
            console.log(`Setting up nav item ${index}:`, view, filter, item);
            
            // Remove any existing listeners
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            
            // Direct click handler
            newItem.onclick = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Nav item clicked!', view, filter);
                
                // Remove active from all nav items
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                newItem.classList.add('active');
                
                this.currentView = view;
                if (filter) {
                    this.currentFilter = filter;
                    console.log('Applying filter:', filter);
                    try {
                        await this.handleFilter(filter);
                    } catch (error) {
                        console.error('Error applying filter:', error);
                    }
                } else {
                    this.currentFilter = null;
                    console.log('Resetting to all data');
                    try {
                        await this.updateDashboard();
                    } catch (error) {
                        console.error('Error updating dashboard:', error);
                    }
                }
            };
            
            // Also add mouseenter for visual feedback
            newItem.onmouseenter = () => {
                if (!newItem.classList.contains('active')) {
                    newItem.style.background = 'var(--bg-hover)';
                }
            };
            
            newItem.onmouseleave = () => {
                if (!newItem.classList.contains('active')) {
                    newItem.style.background = 'transparent';
                }
            };
        });

        // Year navigation with calendar flip animation
        document.getElementById('year-prev')?.addEventListener('click', async () => {
            if (this.currentYear > 2010) {
                this.currentYear--;
                this.animateYearChange();
                await this.updateDashboard();
            }
        });

        document.getElementById('year-next')?.addEventListener('click', async () => {
            if (this.currentYear < 2023) {
                this.currentYear++;
                this.animateYearChange();
                await this.updateDashboard();
            }
        });
    }

    async updateDashboard() {
        console.log('updateDashboard() called');
        try {
            await Promise.all([
                this.updateKPIs(),
                this.updateHeroChart(),
                this.updateMiniBarChart(),
                this.updateProgressChart(),
                this.updateStats(),
                this.updateDateSelector()
            ]);
            console.log('✓ Dashboard updated successfully');
        } catch (error) {
            console.error('✗ Error updating dashboard:', error);
            this.showConnectionError();
        }
    }

    async updateKPIs() {
        try {
            console.log('Updating KPIs for year:', this.currentYear);
            
            // Fetch US summary
            const usSummary = await this.fetchAPI(`/summary/us?year=${this.currentYear}`);
            console.log('US Summary received:', usSummary);
            
            if (!usSummary || !usSummary.total_emissions) {
                throw new Error('Invalid US summary data received');
            }
            
            // KPI 1: Total US Emissions
            document.getElementById('kpi1-value').textContent = this.formatLargeNumber(usSummary.total_emissions);
            this.updateChangeIndicator('kpi1-change', usSummary.percent_change_from_2010, true);

            // KPI 2: Power Sector Share
            try {
                const powerSummary = await this.fetchAPI(`/summary/sector?sector=Power Plants&year=${this.currentYear}`);
                document.getElementById('kpi2-value').textContent = `${powerSummary.percent_of_total.toFixed(1)}%`;
                const powerChange = powerSummary.trend_since_2010;
                this.updateChangeIndicator('kpi2-change', powerChange, true);
            } catch (error) {
                console.error('Error fetching power sector:', error);
                document.getElementById('kpi2-value').textContent = '0%';
            }

            // KPI 3: Facilities Reporting
            document.getElementById('kpi3-value').textContent = this.formatNumber(usSummary.facilities_reporting);
            // Calculate facility change (would need baseline comparison)
            this.updateChangeIndicator('kpi3-change', 0, false);

            // KPI 4: Low-Emission States
            try {
                const lowEmission = await this.fetchAPI(`/states/low_emission?year=${this.currentYear}&percentile=25`);
                document.getElementById('kpi4-value').textContent = lowEmission.count || 0;
                const changeEl = document.getElementById('kpi4-change');
                if (changeEl) {
                    const valueEl = changeEl.querySelector('.change-value');
                    if (valueEl) valueEl.textContent = '';
                }
            } catch (error) {
                console.error('Error fetching low emission states:', error);
                document.getElementById('kpi4-value').textContent = '0';
            }

            // Hero KPI Circle
            const heroValue = usSummary.total_emissions / 1e9; // Convert to billions
            document.getElementById('hero-kpi-value').textContent = `$${heroValue.toFixed(1)}B CO₂e`;
            document.getElementById('hero-kpi-year-label').textContent = `${this.currentYear} Total`;
            
            console.log('✓ KPIs updated successfully');
        } catch (error) {
            console.error('✗ Error updating KPIs:', error);
            // Set default/zero values on error
            document.getElementById('kpi1-value').textContent = '0';
            document.getElementById('kpi2-value').textContent = '0%';
            document.getElementById('kpi3-value').textContent = '0';
            document.getElementById('kpi4-value').textContent = '0';
            document.getElementById('hero-kpi-value').textContent = '$0.0B CO₂e';
            
            // Show error to user
            this.showConnectionError();
        }
    }

    updateChangeIndicator(elementId, change, isPositiveGood) {
        const element = document.getElementById(elementId);
        const arrow = element.querySelector('.change-arrow');
        const value = element.querySelector('.change-value');
        
        const isPositive = change > 0;
        const shouldBeGreen = isPositiveGood ? !isPositive : isPositive;
        
        element.classList.remove('positive', 'negative');
        element.classList.add(shouldBeGreen ? 'positive' : 'negative');
        
        arrow.textContent = isPositive ? '↑' : '↓';
        value.textContent = `${Math.abs(change).toFixed(1)}%`;
    }

    async updateHeroChart() {
        const ctx = document.getElementById('hero-chart');
        if (!ctx) return;

        try {
            // Fetch US trend data
            const trendData = await this.fetchAPI('/chart/us_trend');
            
            if (!trendData || trendData.length === 0) {
                throw new Error('No trend data received');
            }
            
            // Filter data up to current year
            const filteredData = trendData.filter(t => t.year <= this.currentYear);
            
            // Get baseline for change calculation
            const baseline = trendData.find(t => t.year === 2010)?.emissions || 0;
            const currentYearData = filteredData.find(t => t.year === this.currentYear);
            
            const labels = filteredData.map(t => t.year);
            const data = filteredData.map(t => {
                const value = t.emissions / 1e6; // Convert to millions
                const change = baseline > 0 ? ((t.emissions - baseline) / baseline) * 100 : 0;
                const isCurrentYear = t.year === this.currentYear;
                return {
                    x: t.year,
                    y: value,
                    change: change,
                    isCurrentYear: isCurrentYear
                };
            });

            // Destroy existing chart
            if (this.charts.hero) {
                this.charts.hero.destroy();
            }

            this.charts.hero = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Emissions',
                    data: data.map(d => d.y),
                    borderColor: '#C6FF3F',
                    backgroundColor: 'rgba(198, 255, 63, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: data.map(d => d.isCurrentYear ? 8 : 4),
                    pointHoverRadius: data.map(d => d.isCurrentYear ? 10 : 6),
                    pointBackgroundColor: data.map(d => d.isCurrentYear ? '#C6FF3F' : '#5BE88A'),
                    pointBorderColor: '#101116',
                    pointBorderWidth: data.map(d => d.isCurrentYear ? 3 : 2),
                    segment: {
                        borderColor: (ctx) => {
                            const index = ctx.p1DataIndex;
                            return data[index]?.isCurrentYear ? '#C6FF3F' : '#5BE88A';
                        }
                    }
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#181A20',
                        titleColor: '#F5F7FB',
                        bodyColor: '#9BA0B5',
                        borderColor: '#C6FF3F',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            title: () => {
                                return `Total Emissions - ${this.currentYear}`;
                            },
                            label: (context) => {
                                const point = data[context.dataIndex];
                                const year = parseInt(context.label);
                                const isCurrent = year === this.currentYear;
                                const prefix = isCurrent ? '→ ' : '';
                                return [
                                    `${prefix}${this.formatLargeNumber(context.parsed.y * 1e6)} CO₂e`,
                                    `Change: ${point.change.toFixed(1)}% vs 2010`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(157, 160, 181, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#9BA0B5',
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(157, 160, 181, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#9BA0B5',
                            font: {
                                size: 11
                            },
                            callback: (value) => {
                                return `${(value / 1000).toFixed(0)}B`;
                            }
                        }
                    }
                }
            }
        });
        } catch (error) {
            console.error('Error updating hero chart:', error);
            // Chart will remain empty or show previous data
        }
    }

    async updateMiniBarChart() {
        const ctx = document.getElementById('mini-bar-chart');
        if (!ctx) return;

        try {
            // Fetch top states
            const topStatesData = await this.fetchAPI(`/states/top?year=${this.currentYear}&limit=5`);
            
            const labels = topStatesData.states.map(s => s.state);
            const values = topStatesData.states.map(s => s.emissions / 1e6); // Convert to millions

            const min = Math.min(...values);
            const max = Math.max(...values);

            document.getElementById('min-label').textContent = `Min: ${min.toFixed(0)}`;
            document.getElementById('max-label').textContent = `Max: ${max.toFixed(0)}`;
            document.getElementById('mini-chart-year').textContent = this.currentYear;

            if (this.charts.miniBar) {
                this.charts.miniBar.destroy();
            }

            this.charts.miniBar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Emissions',
                    data: values,
                    backgroundColor: (ctx) => {
                        const value = ctx.parsed.y;
                        const ratio = (value - min) / (max - min);
                        return ratio > 0.7 ? '#C6FF3F' : '#5D6273';
                    },
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#181A20',
                        titleColor: '#F5F7FB',
                        bodyColor: '#9BA0B5',
                        borderColor: '#C6FF3F',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: (context) => {
                                return `${this.formatLargeNumber(context.parsed.y * 1e6)} CO₂e`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#9BA0B5',
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(157, 160, 181, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#9BA0B5',
                            font: {
                                size: 10
                            },
                            callback: (value) => {
                                return `${(value / 1000).toFixed(1)}B`;
                            }
                        }
                    }
                }
            }
        });
        } catch (error) {
            console.error('Error updating mini bar chart:', error);
        }
    }

    async updateProgressChart() {
        const ctx = document.getElementById('progress-sparkline');
        if (!ctx) return;

        try {
            // Fetch US trend data
            const trendData = await this.fetchAPI('/chart/us_trend');
            
            if (!trendData || trendData.length === 0) {
                console.error('No trend data available');
                return;
            }
            
            // Sort by year
            trendData.sort((a, b) => a.year - b.year);
            
            // Calculate key metrics
            const baseline2010 = trendData.find(t => t.year === 2010);
            const latest2023 = trendData[trendData.length - 1];
            
            if (!baseline2010 || !latest2023) {
                console.error('Missing baseline or latest data');
                return;
            }
            
            const baselineEmissions = baseline2010.emissions;
            const currentEmissions = latest2023.emissions;
            const totalReduction = ((currentEmissions - baselineEmissions) / baselineEmissions) * 100;
            const absoluteReduction = currentEmissions - baselineEmissions;
            const years = trendData.length - 1;
            const avgAnnualRate = totalReduction / years;
            
            // Update stat displays
            document.getElementById('total-reduction').textContent = `${totalReduction.toFixed(1)}%`;
            document.getElementById('baseline-comparison').textContent = 
                `${(baselineEmissions / 1e9).toFixed(1)}B → ${(currentEmissions / 1e9).toFixed(1)}B`;
            document.getElementById('baseline-value').textContent = `${(baselineEmissions / 1e9).toFixed(2)}B CO₂e`;
            document.getElementById('current-value').textContent = `${(currentEmissions / 1e9).toFixed(2)}B CO₂e (${this.currentYear})`;
            document.getElementById('reduced-value').textContent = `${(absoluteReduction / 1e9).toFixed(2)}B CO₂e`;
            document.getElementById('annual-rate').textContent = `${avgAnnualRate.toFixed(1)}%/yr`;
            
            // Prepare chart data - show actual emissions in billions
            const emissionsData = trendData.map(t => t.emissions / 1e9);
            const labels = trendData.map(t => t.year.toString());
            
            // Calculate min/max for better visualization
            const minEmission = Math.min(...emissionsData);
            const maxEmission = Math.max(...emissionsData);
            const range = maxEmission - minEmission;
            const padding = range * 0.1;

            if (this.charts.progress) {
                this.charts.progress.destroy();
            }

            this.charts.progress = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Total Emissions',
                            data: emissionsData,
                            borderColor: '#5BE88A',
                            backgroundColor: 'rgba(91, 232, 138, 0.15)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            pointBackgroundColor: '#5BE88A',
                            pointBorderColor: '#101116',
                            pointBorderWidth: 2,
                            pointHoverBackgroundColor: '#C6FF3F',
                            pointHoverBorderColor: '#101116'
                        },
                        {
                            label: '2010 Baseline',
                            data: new Array(labels.length).fill(baselineEmissions / 1e9),
                            borderColor: 'rgba(157, 160, 181, 0.3)',
                            borderWidth: 1,
                            borderDash: [5, 5],
                            fill: false,
                            pointRadius: 0,
                            pointHoverRadius: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    layout: {
                        padding: {
                            left: 12,
                            right: 12,
                            top: 12,
                            bottom: 12
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            align: 'end',
                            labels: {
                                color: '#9BA0B5',
                                font: {
                                    size: 11,
                                    weight: '500'
                                },
                                usePointStyle: true,
                                padding: 12,
                                filter: (item) => item.datasetIndex === 0 // Only show main line in legend
                            }
                        },
                        tooltip: {
                            enabled: true,
                            backgroundColor: '#181A20',
                            titleColor: '#F5F7FB',
                            bodyColor: '#9BA0B5',
                            borderColor: '#5BE88A',
                            borderWidth: 1,
                            padding: 12,
                            titleFont: {
                                size: 12,
                                weight: '600'
                            },
                            bodyFont: {
                                size: 11
                            },
                            callbacks: {
                                title: (items) => {
                                    const year = parseInt(items[0].label);
                                    const isCurrent = year === this.currentYear;
                                    return isCurrent ? `Year ${year} (Selected)` : `Year ${year}`;
                                },
                                label: (context) => {
                                    if (context.datasetIndex === 0) {
                                        const value = context.parsed.y;
                                        const reduction = ((value - (baselineEmissions / 1e9)) / (baselineEmissions / 1e9)) * 100;
                                        const year = parseInt(context.label);
                                        const isCurrent = year === this.currentYear;
                                        const prefix = isCurrent ? '→ ' : '';
                                        return [
                                            `${prefix}Emissions: ${value.toFixed(2)}B CO₂e`,
                                            `Change: ${reduction >= 0 ? '+' : ''}${reduction.toFixed(1)}% vs 2010`
                                        ];
                                    }
                                    return `Baseline: ${context.parsed.y.toFixed(2)}B CO₂e`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            grid: {
                                color: 'rgba(157, 160, 181, 0.1)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#9BA0B5',
                                font: {
                                    size: 10
                                },
                                maxRotation: 0,
                                autoSkip: false
                            }
                        },
                        y: {
                            display: true,
                            grid: {
                                color: 'rgba(157, 160, 181, 0.1)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#9BA0B5',
                                font: {
                                    size: 10
                                },
                                callback: (value) => {
                                    return `${value.toFixed(1)}B`;
                                }
                            },
                            min: minEmission - padding,
                            max: maxEmission + padding,
                            title: {
                                display: true,
                                text: 'Billion CO₂e',
                                color: '#9BA0B5',
                                font: {
                                    size: 10,
                                    weight: '500'
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error updating progress chart:', error);
        }
    }

    async updateStats() {
        try {
            // Fetch US summary to get facility count
            const usSummary = await this.fetchAPI(`/summary/us?year=${this.currentYear}`);
            
            // For stats, we can use cached values or make additional calls
            // For now, use reasonable defaults based on known data
            document.getElementById('stat-states').textContent = '54'; // Known from data
            document.getElementById('stat-facilities').textContent = `${usSummary.facilities_reporting.toLocaleString()}+`;
            document.getElementById('stat-sectors').textContent = '77'; // Known from data
            document.getElementById('stat-datapoints').textContent = '100K+'; // Approximate
        } catch (error) {
            console.error('Error updating stats:', error);
            // Fallback to defaults
            document.getElementById('stat-states').textContent = '54';
            document.getElementById('stat-facilities').textContent = '8000+';
            document.getElementById('stat-sectors').textContent = '77';
            document.getElementById('stat-datapoints').textContent = '100K+';
        }
    }

    animateYearChange() {
        const yearValue = document.getElementById('selected-scope');
        if (!yearValue) return;

        // Remove any existing animation classes
        yearValue.classList.remove('flip-out', 'flip-in', 'flip-active');
        
        // Trigger flip-out animation
        yearValue.classList.add('flip-out');
        
        // After flip-out completes, update text and flip in
        setTimeout(() => {
            yearValue.textContent = `${this.currentYear}`;
            yearValue.classList.remove('flip-out');
            yearValue.classList.add('flip-in');
            
            // After flip-in starts, transition to active
            setTimeout(() => {
                yearValue.classList.remove('flip-in');
                yearValue.classList.add('flip-active');
            }, 50);
        }, 200);
    }

    updateDateSelector() {
        const yearValue = document.getElementById('selected-scope');
        if (yearValue && !yearValue.classList.contains('flip-out') && !yearValue.classList.contains('flip-in')) {
            yearValue.textContent = `${this.currentYear}`;
            yearValue.classList.add('flip-active');
        }
        
        // Update subtitle to show range up to current year
        const subtitle = document.getElementById('page-subtitle');
        if (subtitle) {
            if (this.currentYear === 2023) {
                subtitle.textContent = '2010–2023 — EPA GHGRP';
            } else {
                subtitle.textContent = `2010–${this.currentYear} (Selected) — EPA GHGRP`;
            }
        }
    }

    formatLargeNumber(num) {
        if (num >= 1e9) {
            return `${(num / 1e9).toFixed(1)}B`;
        } else if (num >= 1e6) {
            return `${(num / 1e6).toFixed(1)}M`;
        } else if (num >= 1e3) {
            return `${(num / 1e3).toFixed(1)}K`;
        }
        return num.toLocaleString();
    }

    formatNumber(num) {
        return num.toLocaleString();
    }
    
    async handleFilter(filterName) {
        try {
            console.log('handleFilter called with:', filterName);
            
            // Store active filter
            this.currentFilter = filterName;
            
            switch(filterName) {
                case 'power-sector':
                    console.log('Filtering to Power Sector...');
                    // Filter to power sector only
                    const powerData = await this.fetchAPI(`/summary/sector?sector=Power Plants&year=${this.currentYear}`);
                    const powerTrend = await this.fetchAPI(`/chart/sector_trend?sector=Power Plants`);
                    
                    console.log('Power data received:', powerData);
                    console.log('Power trend received:', powerTrend.length, 'points');
                    
                    // Update hero chart with power sector data
                    await this.updateHeroChartWithData(powerTrend, 'Power Sector');
                    
                    // Update KPIs for power sector
                    document.getElementById('kpi1-value').textContent = this.formatLargeNumber(powerData.total_emissions);
                    document.getElementById('kpi2-value').textContent = `${powerData.percent_of_total.toFixed(1)}%`;
                    document.getElementById('hero-kpi-value').textContent = `$${(powerData.total_emissions / 1e9).toFixed(1)}B CO₂e`;
                    
                    // Update mini chart to show top sectors (excluding power to show others)
                    const topSectors = await this.fetchAPI(`/sectors/top?year=${this.currentYear}&limit=5`);
                    await this.updateMiniBarChartWithSectors(topSectors);
                    console.log('Power sector filter applied');
                    break;
                    
                case 'top5-states':
                    console.log('Filtering to Top 5 States...');
                    // Show top 5 states - update all views
                    const topStates = await this.fetchAPI(`/states/top?year=${this.currentYear}&limit=5`);
                    console.log('Top states received:', topStates);
                    
                    // Update hero chart to show combined top 5 states trend
                    const topStatesList = topStates.states.map(s => s.state);
                    await this.updateHeroChartWithTopStates(topStatesList);
                    
                    // Update KPIs to show sum of top 5
                    const top5Total = topStates.states.reduce((sum, s) => sum + s.emissions, 0);
                    document.getElementById('kpi1-value').textContent = this.formatLargeNumber(top5Total);
                    document.getElementById('hero-kpi-value').textContent = `$${(top5Total / 1e9).toFixed(1)}B CO₂e`;
                    
                    // Update mini chart
                    await this.updateMiniBarChartWithStates(topStates);
                    console.log('Top 5 states filter applied');
                    break;
                    
                case 'reduction-states':
                    console.log('Filtering to Reduction States...');
                    // Show states with >20% reduction
                    const reducedStates = await this.fetchAPI(`/states/reduction?threshold=20&baseline_year=2010`);
                    console.log('Reduced states received:', reducedStates);
                    
                    if (reducedStates.states && reducedStates.states.length > 0) {
                        // Get state abbreviations
                        const stateList = reducedStates.states.map(s => s.state);
                        
                        // Update hero chart to show combined trend of reduction states
                        await this.updateHeroChartWithTopStates(stateList);
                        
                        // Calculate total emissions from reduction states
                        const reductionStatesTotal = reducedStates.states.reduce((sum, s) => sum + s.emissions_current, 0);
                        const avgReduction = reducedStates.states.reduce((sum, s) => sum + s.reduction_percent, 0) / reducedStates.states.length;
                        
                        // Update KPIs
                        document.getElementById('kpi1-value').textContent = this.formatLargeNumber(reductionStatesTotal);
                        document.getElementById('kpi2-value').textContent = `${Math.abs(avgReduction).toFixed(1)}%`;
                        document.getElementById('hero-kpi-value').textContent = `${reducedStates.count} States`;
                        
                        // Update mini chart to show these states
                        const reductionStatesData = {
                            states: reducedStates.states.map(s => ({
                                state: s.state,
                                emissions: s.emissions_current
                            }))
                        };
                        await this.updateMiniBarChartWithStates({ states: reductionStatesData.states });
                    } else {
                        document.getElementById('kpi1-value').textContent = '0';
                        document.getElementById('kpi2-value').textContent = '0%';
                        document.getElementById('hero-kpi-value').textContent = '0 States';
                    }
                    console.log('Reduction states filter applied');
                    break;
                    
                case 'high-methane':
                    console.log('Filtering to High Methane States...');
                    // Show high methane states
                    const highMethane = await this.fetchAPI(`/states/high_methane?year=${this.currentYear}&threshold=5`);
                    console.log('High methane states received:', highMethane);
                    
                    if (highMethane.states && highMethane.states.length > 0) {
                        // Get state abbreviations
                        const stateList = highMethane.states.map(s => s.state);
                        
                        // Update hero chart to show combined trend of high methane states
                        await this.updateHeroChartWithTopStates(stateList);
                        
                        // Calculate total emissions from high methane states
                        const highMethaneTotal = highMethane.states.reduce((sum, s) => sum + s.total_emissions, 0);
                        const avgCH4 = highMethane.states.reduce((sum, s) => sum + s.ch4_percent, 0) / highMethane.states.length;
                        
                        // Update KPIs
                        document.getElementById('kpi1-value').textContent = this.formatLargeNumber(highMethaneTotal);
                        document.getElementById('kpi2-value').textContent = `${avgCH4.toFixed(1)}% CH4`;
                        document.getElementById('hero-kpi-value').textContent = `${highMethane.count} States`;
                        
                        // Update mini chart to show these states
                        const highMethaneStatesData = {
                            states: highMethane.states.map(s => ({
                                state: s.state,
                                emissions: s.total_emissions
                            }))
                        };
                        await this.updateMiniBarChartWithStates({ states: highMethaneStatesData.states });
                    } else {
                        document.getElementById('kpi1-value').textContent = '0';
                        document.getElementById('kpi2-value').textContent = '0% CH4';
                        document.getElementById('hero-kpi-value').textContent = '0 States';
                    }
                    console.log('High methane filter applied');
                    break;
                    
                case 'all-data':
                default:
                    console.log('Resetting to all data...');
                    // Reset to all data
                    this.currentFilter = null;
                    await this.updateDashboard();
                    console.log('All data filter applied');
                    break;
            }
        } catch (error) {
            console.error('Error handling filter:', error);
            // On error, reset to all data
            this.currentFilter = null;
            await this.updateDashboard();
        }
    }
    
    async updateHeroChartWithTopStates(stateList) {
        // Fetch trends for states and combine
        const promises = stateList.map(state => this.fetchAPI(`/chart/state_trend?state=${state}`));
        const stateTrends = await Promise.all(promises);
        
        // Combine all state trends by year
        const combinedTrend = {};
        stateTrends.forEach(trend => {
            trend.forEach(point => {
                if (!combinedTrend[point.year]) {
                    combinedTrend[point.year] = { year: point.year, emissions: 0 };
                }
                combinedTrend[point.year].emissions += point.emissions;
            });
        });
        
        const trendArray = Object.values(combinedTrend).sort((a, b) => a.year - b.year);
        
        // Create label based on filter context
        let label = stateList.length <= 5 ? `${stateList.length} States Combined` : `${stateList.length} States`;
        await this.updateHeroChartWithData(trendArray, label);
    }
    
    async updateMiniBarChartWithStates(statesData) {
        const ctx = document.getElementById('mini-bar-chart');
        if (!ctx) return;
        
        const labels = statesData.states.map(s => s.state);
        const values = statesData.states.map(s => s.emissions / 1e6);
        
        const min = Math.min(...values);
        const max = Math.max(...values);
        
        document.getElementById('min-label').textContent = `Min: ${min.toFixed(0)}`;
        document.getElementById('max-label').textContent = `Max: ${max.toFixed(0)}`;
        
        if (this.charts.miniBar) {
            this.charts.miniBar.destroy();
        }
        
        this.charts.miniBar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Emissions',
                    data: values,
                    backgroundColor: (ctx) => {
                        const value = ctx.parsed.y;
                        const ratio = (value - min) / (max - min);
                        return ratio > 0.7 ? '#C6FF3F' : '#5D6273';
                    },
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#181A20',
                        titleColor: '#F5F7FB',
                        bodyColor: '#9BA0B5',
                        borderColor: '#C6FF3F',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: (context) => {
                                return `${this.formatLargeNumber(context.parsed.y * 1e6)} CO₂e`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: '#9BA0B5',
                            font: { size: 10 }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(157, 160, 181, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#9BA0B5',
                            font: { size: 10 },
                            callback: (value) => {
                                return `${(value / 1000).toFixed(1)}B`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    async updateMiniBarChartWithSectors(sectorsData) {
        const ctx = document.getElementById('mini-bar-chart');
        if (!ctx) return;
        
        const labels = sectorsData.sectors.map(s => s.sector.length > 15 ? s.sector.substring(0, 15) + '...' : s.sector);
        const values = sectorsData.sectors.map(s => s.emissions / 1e6);
        
        const min = Math.min(...values);
        const max = Math.max(...values);
        
        document.getElementById('min-label').textContent = `Min: ${min.toFixed(0)}`;
        document.getElementById('max-label').textContent = `Max: ${max.toFixed(0)}`;
        
        if (this.charts.miniBar) {
            this.charts.miniBar.destroy();
        }
        
        this.charts.miniBar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Emissions',
                    data: values,
                    backgroundColor: (ctx) => {
                        const value = ctx.parsed.y;
                        const ratio = (value - min) / (max - min);
                        return ratio > 0.7 ? '#C6FF3F' : '#5D6273';
                    },
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#181A20',
                        titleColor: '#F5F7FB',
                        bodyColor: '#9BA0B5',
                        borderColor: '#C6FF3F',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: (context) => {
                                return `${this.formatLargeNumber(context.parsed.y * 1e6)} CO₂e`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: '#9BA0B5',
                            font: { size: 9 }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(157, 160, 181, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#9BA0B5',
                            font: { size: 10 },
                            callback: (value) => {
                                return `${(value / 1000).toFixed(1)}B`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    async updateHeroChartWithData(data, label) {
        // Helper to update hero chart with custom data
        const ctx = document.getElementById('hero-chart');
        if (!ctx || !data) return;
        
        const labels = data.map(t => t.year);
        const values = data.map(t => t.emissions / 1e6);
        
        if (this.charts.hero) {
            this.charts.hero.destroy();
        }
        
        this.charts.hero = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: values,
                    borderColor: '#C6FF3F',
                    backgroundColor: 'rgba(198, 255, 63, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#C6FF3F',
                    pointBorderColor: '#101116',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#F5F7FB'
                        }
                    },
                    tooltip: {
                        backgroundColor: '#181A20',
                        titleColor: '#F5F7FB',
                        bodyColor: '#9BA0B5',
                        borderColor: '#C6FF3F',
                        borderWidth: 1,
                        padding: 12
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(157, 160, 181, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#9BA0B5',
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(157, 160, 181, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#9BA0B5',
                            font: {
                                size: 11
                            },
                            callback: (value) => {
                                return `${(value / 1000).toFixed(0)}B`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing dashboard...');
    window.dashboard = new Dashboard();
    dashboard.init().then(() => {
        console.log('✓ Dashboard initialized successfully');
    }).catch(error => {
        console.error('✗ Dashboard initialization failed:', error);
    });
});

