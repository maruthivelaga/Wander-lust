import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import { 
  Eye, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  Settings, 
  Navigation, 
  Clock,
  MapPin,
  Calendar,
  DollarSign,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import EnhancedWeather from './EnhanceWeather';
import CurrencyConverter from './CurrencyConverter';
import LanguageTranslator from './LanguageTranslator';
import AdvancedAIChatbot from './AIChatbot';
import { travelService } from '../services/travelService';
// Import Trip type from the appropriate location, adjust the path as needed
import type { Trip } from '../types/Trip';

interface SavedTrip {
  _id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  duration: number;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  savedAt: string;
  totalCost: number;
  itinerary: Array<{
    day: number;
    theme: string;
    activities: any[];
  }>;
  title?: string;
}

const Dashboard: React.FC = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWidget, setActiveWidget] = useState<'weather' | 'currency' | 'translator' | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<SavedTrip | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalExpenses: 0,
    upcomingTrips: 0,
    totalSavings: 0
  });

  useEffect(() => {
    fetchDashboardData();
    loadSavedTrips();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tripsResponse] = await Promise.all([
        travelService.getTrips()
      ]);

      if (tripsResponse) {
        // Ensure all date fields are strings
        const normalizedTrips = tripsResponse.map((trip: any) => ({
          ...trip,
          startDate: typeof trip.startDate === 'string' ? trip.startDate : trip.startDate?.toISOString?.() ?? '',
          endDate: typeof trip.endDate === 'string' ? trip.endDate : trip.endDate?.toISOString?.() ?? '',
        }));
        setTrips(normalizedTrips);

        // Calculate stats from both API trips and saved trips
        calculateStats(normalizedTrips);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedTrips = () => {
    try {
      const trips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
      const sortedTrips = trips.sort((a: SavedTrip, b: SavedTrip) => 
        new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      );
      setSavedTrips(sortedTrips);
    } catch (error) {
      console.error('Error loading saved trips:', error);
    }
  };

  const calculateStats = (apiTrips: Trip[]) => {
    const savedTripsData = JSON.parse(localStorage.getItem('savedTrips') || '[]');
    
    // Combine stats from both sources
    const totalApiExpenses = apiTrips.reduce((sum: number, trip: any) => 
      sum + (trip.totalExpenses || 0), 0
    );
    const totalSavedBudget = savedTripsData.reduce((sum: number, trip: SavedTrip) => 
      sum + (trip.budget || 0), 0
    );

    const upcomingApiTrips = apiTrips.filter((trip: any) => 
      new Date(trip.startDate) > new Date()
    ).length;
    const upcomingSavedTrips = savedTripsData.filter((trip: SavedTrip) => 
      new Date(trip.startDate) > new Date() && trip.status === 'planned'
    ).length;

    setStats({
      totalTrips: apiTrips.length + savedTripsData.length,
      totalExpenses: totalApiExpenses + totalSavedBudget,
      upcomingTrips: upcomingApiTrips + upcomingSavedTrips,
      totalSavings: Math.floor((totalApiExpenses + totalSavedBudget) * 0.15) // Mock savings calculation
    });
  };

  const viewTripDetails = (trip: SavedTrip) => {
    localStorage.setItem('currentTripData', JSON.stringify(trip));
    navigate(`/trip/dashboard/${trip._id}`);
  };

  const cancelTrip = async (trip: SavedTrip) => {
    try {
      const updatedTrips = savedTrips.map(t => 
        t._id === trip._id ? { ...t, status: 'cancelled' as const } : t
      );
      
      localStorage.setItem('savedTrips', JSON.stringify(updatedTrips));
      setSavedTrips(updatedTrips);
      setSelectedTrip(null);
      setShowDeleteModal(false);
      
      toast.success(`Trip to ${trip.destination} cancelled successfully`);
      calculateStats(trips);
    } catch (error) {
      console.error('Error cancelling trip:', error);
      toast.error('Failed to cancel trip');
    }
  };

  const deleteTrip = async (trip: SavedTrip) => {
    try {
      const updatedTrips = savedTrips.filter(t => t._id !== trip._id);
      
      localStorage.setItem('savedTrips', JSON.stringify(updatedTrips));
      setSavedTrips(updatedTrips);
      setSelectedTrip(null);
      setShowDeleteModal(false);
      
      toast.success(`Trip to ${trip.destination} deleted successfully`);
      calculateStats(trips);
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('Failed to delete trip');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return <Calendar className="w-4 h-4" />;
      case 'active': return <Navigation className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const calculateDaysRemaining = (startDate: string) => {
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const quickActions = [
    {
      title: 'Plan New Trip',
      description: 'AI-powered trip planning',
      icon: '✈',
      color: 'bg-blue-500',
      action: () => navigate('/trip-planner')
    },
    {
      title: 'AI Travel Companion',
      description: 'Voice-enabled travel assistant',
      icon: '🎤',
      color: 'bg-purple-500',
      action: () => navigate('/ai-companion')
    },
    {
      title: 'Dynamic Trip Optimizer',
      description: 'Real-time AI optimization',
      icon: '🧠',
      color: 'bg-indigo-500',
      action: () => navigate('/dynamic-planner')
    },
    {
      title: 'LLM Review Analyzer',
      description: 'AI-powered sentiment analysis',
      icon: '📊',
      color: 'bg-teal-500',
      action: () => navigate('/review-analyzer')
    },
    {
      title: '3D Interactive World Map',
      description: 'Explore your travels in 3D',
      icon: '🌍',
      color: 'bg-emerald-500',
      action: () => navigate('/world-map')
    },
    {
      title: 'Smart Reminders & Calendar',
      description: 'AI-powered travel reminders',
      icon: '🔔',
      color: 'bg-rose-500',
      action: () => navigate('/smart-reminders')
    },
    {
      title: 'AR Location Discovery',
      description: 'Augmented reality exploration',
      icon: '📱',
      color: 'bg-orange-500',
      action: () => navigate('/ar-discovery')
    },
    {
      title: 'Social Travel Network',
      description: 'Connect with fellow travelers',
      icon: '👥',
      color: 'bg-purple-500',
      action: () => navigate('/social-network')
    },
    {
      title: 'Predictive Travel Analytics',
      description: 'AI-powered market insights',
      icon: '📈',
      color: 'bg-violet-500',
      action: () => navigate('/predictive-analytics')
    },
    {
      title: 'Multi-Modal AI Assistant',
      description: 'Advanced AI with vision & voice',
      icon: '🤖',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      action: () => navigate('/multimodal-ai')
    },
    {
      title: 'Adaptive AI Companion',
      description: 'Hyper-personalized AI that learns your preferences',
      icon: '✨',
      color: 'bg-gradient-to-r from-indigo-500 to-purple-500',
      action: () => navigate('/adaptive-ai')
    },
    {
      title: 'AI Mood & Story Generator',
      description: 'Capture emotions & create travel stories',
      icon: '✨💭',
      color: 'bg-gradient-to-r from-pink-500 to-purple-500',
      action: () => navigate('/ai-mood-story')
    },
    {
      title: 'Book Flights',
      description: 'Search & compare flights',
      icon: '🛫',
      color: 'bg-green-500',
      action: () => navigate('/booking')
    },
    {
      title: 'Find Hotels',
      description: 'Best accommodation deals',
      icon: '🏨',
      color: 'bg-red-500',
      action: () => navigate('/booking')
    },
    {
      title: 'AI Finance Tracker',
      description: 'Intelligent expense management with AI insights',
      icon: '🧠💰',
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      action: () => navigate('/ai-finance')
    },
    {
      title: 'Predictive Travel Insights',
      description: 'AI-powered travel predictions & analytics',
      icon: '📊🔮',
      color: 'bg-gradient-to-r from-purple-500 to-indigo-500',
      action: () => navigate('/predictive-insights')
    },
    {
      title: 'Smart Packing Assistant',
      description: 'AI-driven packing recommendations & optimization',
      icon: '🧠🎒',
      color: 'bg-gradient-to-r from-teal-500 to-cyan-500',
      action: () => navigate('/smart-packing')
    },
    {
      title: 'Weather Forecast',
      description: 'Check destination weather',
      icon: '🌤',
      color: 'bg-teal-500',
      action: () => setActiveWidget('weather')
    }
  ];

  const travelWidgets = [
    {
      id: 'weather',
      title: 'Weather & Travel Conditions',
      icon: '🌤',
      component: <EnhancedWeather />
    },
    {
      id: 'currency',
      title: 'Currency Converter',
      icon: '💱',
      component: <CurrencyConverter />
    },
    {
      id: 'translator',
      title: 'Language Translator',
      icon: '🗣',
      component: <LanguageTranslator />
    }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Combine trips for display
  const allTrips = [
    ...savedTrips.map(trip => ({
      ...trip,
      isFromLocalStorage: true
    })),
    ...trips.map(trip => ({
      ...trip,
      isFromLocalStorage: false,
      status: trip.status || 'planned'
    }))
  ].sort((a, b) => {
    const aDate = new Date((a as any).savedAt || (a as any).createdAt || a.startDate);
    const bDate = new Date((b as any).savedAt || (b as any).createdAt || b.startDate);
    return bDate.getTime() - aDate.getTime();
  });

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="flex justify-center items-center h-64">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {state.user?.firstName}! ✈
            </h1>
            <p className="text-blue-100 text-lg">
              Ready to plan your next adventure? Here's what's happening with your travels.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-6xl opacity-20">🌍</div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100"
        >
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalTrips}</div>
          <div className="text-sm text-gray-600">Total Trips</div>
          <div className="text-2xl mt-2">🗺</div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6 text-center bg-gradient-to-br from-green-50 to-green-100"
        >
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.upcomingTrips}</div>
          <div className="text-sm text-gray-600">Upcoming Trips</div>
          <div className="text-2xl mt-2">🎒</div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6 text-center bg-gradient-to-br from-purple-50 to-purple-100"
        >
          <div className="text-3xl font-bold text-purple-600 mb-2">${stats.totalExpenses}</div>
          <div className="text-sm text-gray-600">Total Spent</div>
          <div className="text-2xl mt-2">💳</div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6 text-center bg-gradient-to-br from-yellow-50 to-yellow-100"
        >
          <div className="text-3xl font-bold text-yellow-600 mb-2">${stats.totalSavings}</div>
          <div className="text-sm text-gray-600">Money Saved</div>
          <div className="text-2xl mt-2">💰</div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              onClick={action.action}
              className="card p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white text-2xl`}>
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Travel Widgets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Travel Tools</h2>
          <div className="flex space-x-2">
            {travelWidgets.map((widget) => (
              <button
                key={widget.id}
                onClick={() => setActiveWidget(activeWidget === widget.id ? null : widget.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeWidget === widget.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {widget.icon} {widget.title}
              </button>
            ))}
          </div>
        </div>

        {/* Active Widget */}
        <AnimatePresence>
          {activeWidget && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              {travelWidgets.find(w => w.id === activeWidget)?.component}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Enhanced Trips Section - Shows both API and saved trips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Your Trips ({allTrips.length})
            {savedTrips.length > 0 && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                • {savedTrips.length} AI-planned trips
              </span>
            )}
          </h2>
          <Button onClick={() => navigate('/trip-planner')}>
            Plan New Trip
          </Button>
        </div>

        {allTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {allTrips.slice(0, 9).map((trip: any, index) => {
                const daysRemaining = calculateDaysRemaining(trip.startDate);
                const isLocalTrip = trip.isFromLocalStorage;
                
                return (
                  <motion.div
                    key={trip._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1 }}
                    className="card hover:shadow-lg transition-shadow relative group"
                  >
                    {/* Trip Visual */}
                    <div className={`h-48 ${
                      isLocalTrip 
                        ? 'bg-gradient-to-br from-indigo-400 to-purple-500' 
                        : 'bg-gradient-to-br from-blue-400 to-purple-500'
                    } rounded-t-lg flex items-center justify-center text-white text-4xl relative`}>
                      {isLocalTrip ? '🤖' : '🏖'}
                      
                      {/* AI Badge for locally saved trips */}
                      {isLocalTrip && (
                        <div className="absolute top-2 left-2 bg-white bg-opacity-20 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium">
                          AI Planned
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(trip.status)}`}>
                        {getStatusIcon(trip.status)}
                        <span>{trip.status.toUpperCase()}</span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                        {trip.title || trip.destination}
                      </h3>
                      
                      {trip.destination && trip.title && (
                        <p className="text-gray-600 text-sm mb-2">📍 {trip.destination}</p>
                      )}
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(trip.startDate).toLocaleDateString()}
                          {trip.endDate && ` - ${new Date(trip.endDate).toLocaleDateString()}`}
                        </div>
                        
                        {(trip.budget || trip.totalExpenses) && (
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="w-4 h-4 mr-2" />
                            ${trip.budget || trip.totalExpenses || 0}
                          </div>
                        )}

                        {trip.travelers && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-2" />
                            {trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}
                          </div>
                        )}

                        {daysRemaining > 0 && trip.status === 'planned' && (
                          <div className="flex items-center text-sm text-green-600">
                            <Clock className="w-4 h-4 mr-2" />
                            {daysRemaining} days remaining
                          </div>
                        )}
                      </div>

                      {/* Trip Preview for AI-planned trips */}
                      {isLocalTrip && trip.itinerary && trip.itinerary.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-2">ITINERARY PREVIEW</p>
                          <div className="space-y-1">
                            {trip.itinerary.slice(0, 2).map((day: any, i: number) => (
                              <div key={i} className="text-sm text-gray-600 flex items-center">
                                <div className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></div>
                                <span className="truncate">Day {day.day}: {day.theme}</span>
                              </div>
                            ))}
                            {trip.itinerary.length > 2 && (
                              <div className="text-sm text-gray-500 flex items-center">
                                <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                                <span>+{trip.itinerary.length - 2} more days...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        {isLocalTrip ? (
                          <>
                            <button
                              onClick={() => viewTripDetails(trip)}
                              className="flex-1 flex items-center justify-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </button>
                            
                            {trip.status === 'planned' && (
                              <button
                                onClick={() => navigate(`/trip/map/${trip._id}`)}
                                className="flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                              >
                                <Navigation className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelectedTrip(trip);
                                setShowDeleteModal(true);
                              }}
                              className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium py-2">
                            View Details →
                          </button>
                        )}
                      </div>

                      {/* Saved Date for AI-planned trips */}
                      {isLocalTrip && trip.savedAt && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-400">
                            AI Planned: {new Date(trip.savedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips planned yet</h3>
            <p className="text-gray-600 mb-6">Start planning your next adventure with AI!</p>
            <Button onClick={() => navigate('/trip-planner')}>
              Create Your First AI Trip
            </Button>
          </div>
        )}
      </motion.div>

      {/* AI Features Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-8"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🤖 AI-Powered Travel Features</h2>
          <p className="text-gray-600">Experience the future of travel planning</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-3">🧠</div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Recommendations</h3>
            <p className="text-sm text-gray-600">
              AI analyzes your preferences to suggest perfect destinations, activities, and experiences.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-3">📅</div>
            <h3 className="font-semibold text-gray-900 mb-2">Intelligent Itineraries</h3>
            <p className="text-sm text-gray-600">
              Generate optimized day-by-day plans based on your budget, interests, and travel style.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-semibold text-gray-900 mb-2">24/7 AI Assistant</h3>
            <p className="text-sm text-gray-600">
              Get instant answers to travel questions, emergency assistance, and real-time support.
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Button 
            onClick={() => navigate('/trip-planner')}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            Try AI Trip Planning Now →
          </Button>
        </div>
      </motion.div>

      {/* Trip Management Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedTrip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Manage Trip to {selectedTrip.destination}
                </h3>
                
                <p className="text-gray-600 mb-6">
                  What would you like to do with this AI-planned trip?
                </p>

                <div className="space-y-3">
                  {selectedTrip.status === 'planned' && (
                    <button
                      onClick={() => cancelTrip(selectedTrip)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Cancel Trip
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteTrip(selectedTrip)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Trip
                  </button>

                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedTrip(null);
                    }}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Keep Trip
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Chatbot - Always available */}
      <AdvancedAIChatbot />
    </div>
  );
};

export default Dashboard;