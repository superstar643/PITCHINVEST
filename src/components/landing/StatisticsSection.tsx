import React from 'react';
import { FolderOpen, Users, DollarSign, CheckCircle } from 'lucide-react';

const statistics = [
  {
    icon: FolderOpen,
    value: '3,847',
    label: 'ACTIVE PROJECTS',
  },
  {
    icon: Users,
    value: '1,932',
    label: 'VERIFIED INVESTORS',
  },
  {
    icon: DollarSign,
    value: '€127M',
    label: 'TOTAL INVESTED',
  },
  {
    icon: CheckCircle,
    value: '892',
    label: 'SUCCESS STORIES',
  },
];

const StatisticsSection: React.FC = () => {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {statistics.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="border-2 border-[#0a3d5c] rounded-lg p-6 md:p-8 text-center bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#0a3d5c]/10 flex items-center justify-center border border-[#0a3d5c]/20">
                    <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-[#0a3d5c]" strokeWidth={2} />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm lg:text-base text-gray-600 font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;

