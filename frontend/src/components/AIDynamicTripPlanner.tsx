import React, { useState } from 'react';
import { Brain, RefreshCw } from 'lucide-react';
import Button from './Button';
import toast from 'react-hot-toast';

const AIDynamicTripPlanner: React.FC = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    toast.success(' AI Dynamic Trip Planner is working!');
    setIsOptimizing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
             AI Dynamic Trip Planner
          </h1>
          <p className="text-gray-600 mb-6">
            Smart itinerary optimization with real-time adaptations
          </p>
          <Button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isOptimizing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Brain className="w-4 h-4 mr-2" />
            )}
            Optimize Trip
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIDynamicTripPlanner;
