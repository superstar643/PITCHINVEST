import React, { useState, useEffect } from 'react';

const stats = [
  { label: 'Active Users', value: 50000, suffix: '+' },
  { label: 'Projects Completed', value: 12500, suffix: '+' },
  { label: 'Countries Worldwide', value: 120, suffix: '+' },
  { label: 'Customer Satisfaction', value: 98, suffix: '%' }
];

const StatsSection: React.FC = () => {
  const [counters, setCounters] = useState(stats.map(() => 0));

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    stats.forEach((stat, index) => {
      let current = 0;
      const increment = stat.value / steps;
      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          current = stat.value;
          clearInterval(timer);
        }
        setCounters(prev => {
          const newCounters = [...prev];
          newCounters[index] = Math.floor(current);
          return newCounters;
        });
      }, interval);
    });
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-600">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-5xl font-bold text-center text-white mb-16">
          Trusted by Thousands
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl font-bold text-white mb-2">
                {counters[index].toLocaleString()}{stat.suffix}
              </div>
              <div className="text-xl text-purple-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
