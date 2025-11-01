import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  Clock,
  Bell,
  Plus,
  X,
  Edit3,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Cloud,
  MapPin,
  Plane,
  Camera,
  Briefcase,
  Shield,
  Heart,
  Settings,
  Download,
  Upload,
  Filter,
  Search
} from 'lucide-react';
import Button from './Button';

// Reminder types and interfaces
interface TravelReminder {
  id: string;
  title: string;
  description: string;
  type: 'pre_trip' | 'during_trip' | 'post_trip' | 'weather' | 'document' | 'health' | 'booking';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reminderDate: string;
  reminderTime: string;
  tripId?: string;
  destination?: string;
  isCompleted: boolean;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  weatherCondition?: string;
  notificationMethods: ('push' | 'email' | 'sms')[];
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'reminder' | 'trip' | 'flight' | 'hotel' | 'activity';
  description?: string;
  location?: string;
  color: string;
}

interface WeatherAlert {
  id: string;
  destination: string;
  condition: string;
  severity: 'info' | 'warning' | 'severe';
  message: string;
  date: string;
}

const SmartRemindersCalendar: React.FC = () => {
  // State management
  const [reminders, setReminders] = useState<TravelReminder[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentView, setCurrentView] = useState<'calendar' | 'reminders' | 'weather'>('calendar');
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [editingReminder, setEditingReminder] = useState<TravelReminder | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // New reminder form state
  const [newReminder, setNewReminder] = useState<Partial<TravelReminder>>({
    title: '',
    description: '',
    type: 'pre_trip',
    priority: 'medium',
    reminderDate: new Date().toISOString().split('T')[0],
    reminderTime: '09:00',
    isRecurring: false,
    notificationMethods: ['push'],
    checklist: []
  });

  // Initialize data and permissions
  useEffect(() => {
    initializeReminders();
    initializeCalendarEvents();
    initializeWeatherAlerts();
    requestNotificationPermission();
  }, []);

  // Auto-check for due reminders
  useEffect(() => {
    const interval = setInterval(checkDueReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [reminders]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const initializeReminders = () => {
    const sampleReminders: TravelReminder[] = [
      {
        id: '1',
        title: 'Check Passport Expiry',
        description: 'Ensure passport is valid for at least 6 months',
        type: 'document',
        priority: 'high',
        reminderDate: '2024-01-15',
        reminderTime: '10:00',
        destination: 'Japan',
        isCompleted: false,
        isRecurring: false,
        notificationMethods: ['push', 'email'],
        checklist: [
          { id: '1', text: 'Check passport expiry date', isCompleted: false, category: 'Document', priority: 'high' },
          { id: '2', text: 'Renew if needed', isCompleted: false, category: 'Document', priority: 'high' },
          { id: '3', text: 'Make copies', isCompleted: false, category: 'Document', priority: 'medium' }
        ],
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      },
      {
        id: '2',
        title: 'Pack Winter Clothes',
        description: 'Pack appropriate clothing for cold weather',
        type: 'pre_trip',
        priority: 'medium',
        reminderDate: '2024-01-20',
        reminderTime: '20:00',
        destination: 'Norway',
        isCompleted: false,
        isRecurring: false,
        weatherCondition: 'snow',
        notificationMethods: ['push'],
        checklist: [
          { id: '4', text: 'Heavy winter coat', isCompleted: false, category: 'Clothing', priority: 'high' },
          { id: '5', text: 'Thermal underwear', isCompleted: false, category: 'Clothing', priority: 'high' },
          { id: '6', text: 'Waterproof boots', isCompleted: false, category: 'Clothing', priority: 'high' },
          { id: '7', text: 'Warm accessories', isCompleted: false, category: 'Clothing', priority: 'medium' }
        ],
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      },
      {
        id: '3',
        title: 'Flight Check-in Reminder',
        description: 'Check-in online 24 hours before departure',
        type: 'booking',
        priority: 'urgent',
        reminderDate: '2024-01-25',
        reminderTime: '08:00',
        destination: 'France',
        isCompleted: false,
        isRecurring: false,
        notificationMethods: ['push', 'email', 'sms'],
        checklist: [
          { id: '8', text: 'Online check-in', isCompleted: false, category: 'Travel', priority: 'urgent' },
          { id: '9', text: 'Print boarding passes', isCompleted: false, category: 'Travel', priority: 'high' },
          { id: '10', text: 'Check baggage requirements', isCompleted: false, category: 'Travel', priority: 'medium' }
        ],
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      },
      {
        id: '4',
        title: 'Travel Insurance',
        description: 'Purchase comprehensive travel insurance',
        type: 'health',
        priority: 'high',
        reminderDate: '2024-01-18',
        reminderTime: '14:00',
        isCompleted: false,
        isRecurring: false,
        notificationMethods: ['push', 'email'],
        checklist: [
          { id: '11', text: 'Compare insurance plans', isCompleted: false, category: 'Insurance', priority: 'high' },
          { id: '12', text: 'Purchase policy', isCompleted: false, category: 'Insurance', priority: 'high' },
          { id: '13', text: 'Save policy documents', isCompleted: false, category: 'Insurance', priority: 'medium' }
        ],
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      }
    ];

    setReminders(sampleReminders);
  };

  const initializeCalendarEvents = () => {
    const sampleEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Flight to Japan',
        start: '2024-01-26T06:00:00',
        end: '2024-01-26T20:00:00',
        type: 'flight',
        description: 'JAL Flight JL123',
        location: 'Tokyo Haneda Airport',
        color: '#3b82f6'
      },
      {
        id: '2',
        title: 'Hotel Check-in',
        start: '2024-01-26T22:00:00',
        end: '2024-01-26T23:00:00',
        type: 'hotel',
        description: 'Park Hyatt Tokyo',
        location: 'Shinjuku, Tokyo',
        color: '#10b981'
      },
      {
        id: '3',
        title: 'Passport Check Reminder',
        start: '2024-01-15T10:00:00',
        end: '2024-01-15T10:30:00',
        type: 'reminder',
        description: 'Check passport expiry',
        color: '#f59e0b'
      },
      {
        id: '4',
        title: 'Mt. Fuji Tour',
        start: '2024-01-28T08:00:00',
        end: '2024-01-28T18:00:00',
        type: 'activity',
        description: 'Guided tour to Mt. Fuji',
        location: 'Mt. Fuji, Japan',
        color: '#8b5cf6'
      }
    ];

    setCalendarEvents(sampleEvents);
  };

  const initializeWeatherAlerts = () => {
    const sampleAlerts: WeatherAlert[] = [
      {
        id: '1',
        destination: 'Tokyo, Japan',
        condition: 'Heavy Rain',
        severity: 'warning',
        message: 'Heavy rainfall expected during your visit. Pack umbrella and waterproof clothing.',
        date: '2024-01-27'
      },
      {
        id: '2',
        destination: 'Tromsø, Norway',
        condition: 'Extreme Cold',
        severity: 'severe',
        message: 'Temperatures dropping to -25°C. Ensure proper winter clothing and equipment.',
        date: '2024-02-05'
      },
      {
        id: '3',
        destination: 'Paris, France',
        condition: 'Clear Skies',
        severity: 'info',
        message: 'Perfect weather for sightseeing! Sunny with mild temperatures.',
        date: '2024-01-30'
      }
    ];

    setWeatherAlerts(sampleAlerts);
  };

  const checkDueReminders = useCallback(() => {
    const now = new Date();
    const dueReminders = reminders.filter(reminder => {
      if (reminder.isCompleted) return false;
      
      const reminderDateTime = new Date(`${reminder.reminderDate}T${reminder.reminderTime}`);
      return reminderDateTime <= now;
    });

    dueReminders.forEach(reminder => {
      if (reminder.notificationMethods.includes('push') && notificationPermission === 'granted') {
        showNotification(reminder);
      }
    });
  }, [reminders, notificationPermission]);

  const showNotification = (reminder: TravelReminder) => {
    if ('Notification' in window && notificationPermission === 'granted') {
      new Notification(reminder.title, {
        body: reminder.description,
        icon: '/favicon.ico',
        tag: reminder.id,
        requireInteraction: true
      });
    }
  };

  const addReminder = () => {
    if (!newReminder.title || !newReminder.reminderDate) return;

    const reminder: TravelReminder = {
      id: Date.now().toString(),
      title: newReminder.title!,
      description: newReminder.description || '',
      type: newReminder.type!,
      priority: newReminder.priority!,
      reminderDate: newReminder.reminderDate!,
      reminderTime: newReminder.reminderTime!,
      destination: newReminder.destination,
      isCompleted: false,
      isRecurring: newReminder.isRecurring!,
      recurringPattern: newReminder.recurringPattern,
      weatherCondition: newReminder.weatherCondition,
      notificationMethods: newReminder.notificationMethods!,
      checklist: newReminder.checklist || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setReminders(prev => [...prev, reminder]);
    resetNewReminder();
    setShowAddReminder(false);
  };

  const resetNewReminder = () => {
    setNewReminder({
      title: '',
      description: '',
      type: 'pre_trip',
      priority: 'medium',
      reminderDate: new Date().toISOString().split('T')[0],
      reminderTime: '09:00',
      isRecurring: false,
      notificationMethods: ['push'],
      checklist: []
    });
  };

  const updateReminder = (updatedReminder: TravelReminder) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === updatedReminder.id 
        ? { ...updatedReminder, updatedAt: new Date().toISOString() }
        : reminder
    ));
  };

  const deleteReminder = (reminderId: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== reminderId));
  };

  const toggleReminderComplete = (reminderId: string) => {
    setReminders(prev => prev.map(reminder =>
      reminder.id === reminderId
        ? { ...reminder, isCompleted: !reminder.isCompleted, updatedAt: new Date().toISOString() }
        : reminder
    ));
  };

  const toggleChecklistItem = (reminderId: string, itemId: string) => {
    setReminders(prev => prev.map(reminder =>
      reminder.id === reminderId
        ? {
            ...reminder,
            checklist: reminder.checklist.map(item =>
              item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
            ),
            updatedAt: new Date().toISOString()
          }
        : reminder
    ));
  };

  const addChecklistItem = (reminderId: string, text: string, category: string = 'General') => {
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text,
      isCompleted: false,
      category,
      priority: 'medium'
    };

    setReminders(prev => prev.map(reminder =>
      reminder.id === reminderId
        ? {
            ...reminder,
            checklist: [...reminder.checklist, newItem],
            updatedAt: new Date().toISOString()
          }
        : reminder
    ));
  };

  const filteredReminders = reminders.filter(reminder => {
    const matchesType = filterType === 'all' || reminder.type === filterType;
    const matchesSearch = reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reminder.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (reminder.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesType && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20';
      case 'low': return 'text-green-500 bg-green-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pre_trip': return <Briefcase className="h-4 w-4" />;
      case 'during_trip': return <MapPin className="h-4 w-4" />;
      case 'post_trip': return <Camera className="h-4 w-4" />;
      case 'weather': return <Cloud className="h-4 w-4" />;
      case 'document': return <Shield className="h-4 w-4" />;
      case 'health': return <Heart className="h-4 w-4" />;
      case 'booking': return <Plane className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const exportReminders = () => {
    const dataStr = JSON.stringify(reminders, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'travel_reminders.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importReminders = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedReminders = JSON.parse(e.target?.result as string);
        setReminders(prev => [...prev, ...importedReminders]);
      } catch (error) {
        console.error('Error importing reminders:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            🔔 Smart Reminders & Calendar
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Intelligent travel planning with automated reminders
          </p>

          {/* View Toggle */}
          <div className="flex justify-center gap-2 mb-6">
            {[
              { id: 'calendar', label: 'Calendar', icon: <Calendar className="h-4 w-4" /> },
              { id: 'reminders', label: 'Reminders', icon: <Bell className="h-4 w-4" /> },
              { id: 'weather', label: 'Weather Alerts', icon: <Cloud className="h-4 w-4" /> }
            ].map((view) => (
              <Button
                key={view.id}
                onClick={() => setCurrentView(view.id as any)}
                className={`${
                  currentView === view.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {view.icon}
                {view.label}
              </Button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Button
              onClick={() => setShowAddReminder(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Reminder
            </Button>

            <Button
              onClick={exportReminders}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>

            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={importReminders}
                className="hidden"
              />
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
            </label>

            <Button
              onClick={requestNotificationPermission}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Settings className="mr-2 h-4 w-4" />
              Notifications
            </Button>
          </div>

          {/* Search and Filter */}
          {currentView === 'reminders' && (
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search reminders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="pre_trip">Pre-trip</option>
                <option value="during_trip">During Trip</option>
                <option value="post_trip">Post-trip</option>
                <option value="weather">Weather</option>
                <option value="document">Documents</option>
                <option value="health">Health</option>
                <option value="booking">Bookings</option>
              </select>
            </div>
          )}
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          {currentView === 'calendar' && (
            <>
              {/* Calendar Component */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                >
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <Calendar className="mr-2 h-6 w-6" />
                    Travel Calendar
                  </h3>

                  {/* Simple calendar grid */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-sm font-semibold text-gray-300 p-2">
                        {day}
                      </div>
                    ))}
                    
                    {/* Calendar days (simplified) */}
                    {Array.from({ length: 35 }, (_, i) => {
                      const day = i - 5; // Start from previous month
                      const date = new Date(2024, 0, day + 1);
                      const isToday = date.toDateString() === new Date().toDateString();
                      const hasEvent = calendarEvents.some(event => 
                        new Date(event.start).toDateString() === date.toDateString()
                      );
                      
                      return (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.05 }}
                          className={`p-2 text-center cursor-pointer rounded-lg transition-all ${
                            isToday 
                              ? 'bg-blue-600 text-white' 
                              : hasEvent 
                                ? 'bg-purple-500/30 text-white' 
                                : 'bg-white/5 text-gray-300 hover:bg-white/10'
                          }`}
                          onClick={() => setSelectedDate(date.toISOString().split('T')[0])}
                        >
                          <div className="text-sm">{date.getDate()}</div>
                          {hasEvent && (
                            <div className="w-1 h-1 bg-yellow-400 rounded-full mx-auto mt-1"></div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              {/* Events Sidebar */}
              <div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                >
                  <h3 className="text-xl font-bold text-white mb-4">
                    Upcoming Events
                  </h3>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {calendarEvents.map((event) => (
                      <motion.div
                        key={event.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-3 bg-white/5 border border-white/20 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white text-sm">{event.title}</h4>
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: event.color }}
                          ></div>
                        </div>
                        
                        <p className="text-xs text-gray-300 mb-1">
                          {new Date(event.start).toLocaleString()}
                        </p>
                        
                        {event.location && (
                          <p className="text-xs text-gray-400 mb-1">
                            <MapPin className="inline mr-1 h-3 w-3" />
                            {event.location}
                          </p>
                        )}
                        
                        {event.description && (
                          <p className="text-xs text-gray-400">{event.description}</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </>
          )}

          {/* Reminders View */}
          {currentView === 'reminders' && (
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Bell className="mr-2 h-6 w-6" />
                  Travel Reminders ({filteredReminders.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredReminders.map((reminder) => (
                    <motion.div
                      key={reminder.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg border transition-all ${
                        reminder.isCompleted
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-white/5 border-white/20'
                      }`}
                    >
                      {/* Reminder Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`p-1 rounded ${getPriorityColor(reminder.priority)}`}>
                            {getTypeIcon(reminder.type)}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(reminder.priority)}`}>
                            {reminder.priority.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex space-x-1">
                          <button
                            onClick={() => toggleReminderComplete(reminder.id)}
                            className={`p-1 rounded transition-colors ${
                              reminder.isCompleted 
                                ? 'text-green-400 hover:text-green-300' 
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingReminder(reminder)}
                            className="p-1 text-gray-400 hover:text-white rounded transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteReminder(reminder.id)}
                            className="p-1 text-red-400 hover:text-red-300 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Reminder Content */}
                      <h4 className={`font-semibold mb-2 ${
                        reminder.isCompleted ? 'text-gray-400 line-through' : 'text-white'
                      }`}>
                        {reminder.title}
                      </h4>
                      
                      <p className="text-sm text-gray-300 mb-2">{reminder.description}</p>
                      
                      {reminder.destination && (
                        <p className="text-xs text-gray-400 mb-2">
                          <MapPin className="inline mr-1 h-3 w-3" />
                          {reminder.destination}
                        </p>
                      )}

                      <div className="flex items-center text-xs text-gray-400 mb-3">
                        <Clock className="mr-1 h-3 w-3" />
                        {new Date(`${reminder.reminderDate}T${reminder.reminderTime}`).toLocaleString()}
                      </div>

                      {/* Checklist */}
                      {reminder.checklist.length > 0 && (
                        <div className="border-t border-white/10 pt-3">
                          <h5 className="text-xs font-semibold text-gray-300 mb-2">Checklist:</h5>
                          <div className="space-y-1">
                            {reminder.checklist.slice(0, 3).map((item) => (
                              <div key={item.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={item.isCompleted}
                                  onChange={() => toggleChecklistItem(reminder.id, item.id)}
                                  className="w-3 h-3 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className={`text-xs ${
                                  item.isCompleted ? 'text-gray-400 line-through' : 'text-gray-300'
                                }`}>
                                  {item.text}
                                </span>
                              </div>
                            ))}
                            {reminder.checklist.length > 3 && (
                              <div className="text-xs text-gray-400">
                                +{reminder.checklist.length - 3} more items
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Weather Alerts View */}
          {currentView === 'weather' && (
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Cloud className="mr-2 h-6 w-6" />
                  Weather Alerts
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {weatherAlerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg border ${
                        alert.severity === 'severe' 
                          ? 'bg-red-500/10 border-red-500/30' 
                          : alert.severity === 'warning'
                            ? 'bg-orange-500/10 border-orange-500/30'
                            : 'bg-blue-500/10 border-blue-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-white">{alert.destination}</h4>
                        <div className={`p-1 rounded ${
                          alert.severity === 'severe' 
                            ? 'text-red-400 bg-red-500/20' 
                            : alert.severity === 'warning'
                              ? 'text-orange-400 bg-orange-500/20'
                              : 'text-blue-400 bg-blue-500/20'
                        }`}>
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      </div>

                      <p className="text-sm font-medium text-white mb-2">{alert.condition}</p>
                      <p className="text-sm text-gray-300 mb-3">{alert.message}</p>
                      
                      <div className="flex items-center text-xs text-gray-400">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(alert.date).toLocaleDateString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Add Reminder Modal */}
        <AnimatePresence>
          {showAddReminder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowAddReminder(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold text-white mb-6">Add New Reminder</h3>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Reminder title"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <textarea
                    placeholder="Description"
                    value={newReminder.description}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={newReminder.type}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, type: e.target.value as any }))}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pre_trip">Pre-trip</option>
                      <option value="during_trip">During Trip</option>
                      <option value="post_trip">Post-trip</option>
                      <option value="weather">Weather</option>
                      <option value="document">Documents</option>
                      <option value="health">Health</option>
                      <option value="booking">Bookings</option>
                    </select>

                    <select
                      value={newReminder.priority}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      value={newReminder.reminderDate}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, reminderDate: e.target.value }))}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                      type="time"
                      value={newReminder.reminderTime}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, reminderTime: e.target.value }))}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Destination (optional)"
                    value={newReminder.destination || ''}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, destination: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center text-white">
                      <input
                        type="checkbox"
                        checked={newReminder.isRecurring}
                        onChange={(e) => setNewReminder(prev => ({ ...prev, isRecurring: e.target.checked }))}
                        className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      Recurring
                    </label>

                    {newReminder.isRecurring && (
                      <select
                        value={newReminder.recurringPattern}
                        onChange={(e) => setNewReminder(prev => ({ ...prev, recurringPattern: e.target.value as any }))}
                        className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-white mb-2">Notification Methods:</label>
                    <div className="flex space-x-4">
                      {['push', 'email', 'sms'].map((method) => (
                        <label key={method} className="flex items-center text-white">
                          <input
                            type="checkbox"
                            checked={newReminder.notificationMethods?.includes(method as any)}
                            onChange={(e) => {
                              const methods = newReminder.notificationMethods || [];
                              if (e.target.checked) {
                                setNewReminder(prev => ({ 
                                  ...prev, 
                                  notificationMethods: [...methods, method as any] 
                                }));
                              } else {
                                setNewReminder(prev => ({ 
                                  ...prev, 
                                  notificationMethods: methods.filter(m => m !== method) 
                                }));
                              }
                            }}
                            className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          {method.toUpperCase()}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    onClick={() => setShowAddReminder(false)}
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addReminder}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add Reminder
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SmartRemindersCalendar;