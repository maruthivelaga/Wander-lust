import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Search,
  Filter,
  UserPlus,
  UserCheck,
  Globe,
  Camera,
  Video,
  Plane,
  Map,
  TrendingUp,
  Award,
  MessageSquare,
  Vote,
  Clock,
  Eye,
  ThumbsUp,
  Send,
  Plus,
  Settings,
  Bell,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Info,
  X
} from 'lucide-react';

interface UserProfile {
  userId: string;
  username: string;
  fullName: string;
  avatar: string;
  bio: string;
  location: {
    city: string;
    country: string;
  };
  stats: {
    followers: number;
    following: number;
    posts: number;
    travelScore: number;
    visitedCountries: number;
  };
  preferences: {
    travelStyle: string[];
    interests: string[];
    languages: string[];
  };
  badges: string[];
  isVerified: boolean;
  isFollowing?: boolean;
}

interface TravelPost {
  _id: string;
  userId: string;
  user: UserProfile;
  destination: {
    name: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  content: string;
  media: {
    images: string[];
    videos: string[];
  };
  details: {
    duration: string;
    budget: number;
    travelType: string;
    rating: number;
    season: string;
    accommodation: string;
    transportation: string;
  };
  tags: string[];
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    bookmarks: number;
    views: number;
  };
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
}

interface GroupTrip {
  _id: string;
  title: string;
  description: string;
  destination: {
    name: string;
    country: string;
  };
  dates: {
    startDate: string;
    endDate: string;
    flexible: boolean;
  };
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  capacity: {
    min: number;
    max: number;
    current: number;
  };
  adminId: string;
  admin: UserProfile;
  tags: string[];
  status: string;
  createdAt: string;
}

interface TravelCompanion {
  userId: string;
  username: string;
  fullName: string;
  avatar: string;
  location: {
    country: string;
  };
  stats: {
    travelScore: number;
    visitedCountries: number;
  };
  preferences: {
    travelStyle: string[];
    interests: string[];
  };
  compatibilityScore: number;
  matchReasons: string[];
}

const SocialTravelNetwork: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<'feed' | 'discover' | 'groups' | 'companions'>('feed');
  const [posts, setPosts] = useState<TravelPost[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [groupTrips, setGroupTrips] = useState<GroupTrip[]>([]);
  const [companions, setCompanions] = useState<TravelCompanion[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [trendingDestinations, setTrendingDestinations] = useState<any[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedFilter, setFeedFilter] = useState<'all' | 'following' | 'trending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [newPost, setNewPost] = useState({
    destination: '',
    content: '',
    rating: 5,
    budget: 0,
    travelType: 'solo',
    tags: [] as string[]
  });
  const [newTrip, setNewTrip] = useState({
    title: '',
    description: '',
    destination: { name: '', country: '' },
    dates: { startDate: '', endDate: '', flexible: false },
    budget: { min: 0, max: 0, currency: 'USD' },
    capacity: { min: 2, max: 10 },
    tags: [] as string[]
  });

  // API calls
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/social/profile', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setUserProfile(data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, []);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/social/feed?filter=${feedFilter}&sortBy=recent&limit=20`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setPosts(data.data.posts);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to load feed');
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  }, [feedFilter]);

  const fetchGroupTrips = useCallback(async () => {
    try {
      const response = await fetch('/api/social/group-trips?filter=available&limit=20', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setGroupTrips(data.data.trips);
      }
    } catch (error) {
      console.error('Error fetching group trips:', error);
    }
  }, []);

  const fetchCompanions = useCallback(async () => {
    try {
      const response = await fetch('/api/social/discover/companions?limit=20&minCompatibility=60', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setCompanions(data.data.companions);
      }
    } catch (error) {
      console.error('Error fetching companions:', error);
    }
  }, []);

  const fetchRecommendations = useCallback(async (type: string) => {
    try {
      const response = await fetch(`/api/social/recommendations/${type}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  }, []);

  const fetchTrendingDestinations = useCallback(async () => {
    try {
      const response = await fetch('/api/social/trending/destinations', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setTrendingDestinations(data.data);
      }
    } catch (error) {
      console.error('Error fetching trending destinations:', error);
    }
  }, []);

  // Actions
  const handleLikePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/social/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post._id === postId
              ? {
                  ...post,
                  isLiked: data.data.liked,
                  engagement: {
                    ...post.engagement,
                    likes: post.engagement.likes + (data.data.liked ? 1 : -1)
                  }
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleFollowUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/social/follow/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      
      if (data.success) {
        // Update UI to reflect follow status
        console.log(`User ${data.data.action}: ${userId}`);
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.destination || !newPost.content) {
      setError('Destination and content are required');
      return;
    }

    try {
      const response = await fetch('/api/social/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newPost)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowCreatePost(false);
        setNewPost({
          destination: '',
          content: '',
          rating: 5,
          budget: 0,
          travelType: 'solo',
          tags: []
        });
        fetchFeed(); // Refresh feed
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to create post');
      console.error('Error creating post:', error);
    }
  };

  const handleCreateTrip = async () => {
    if (!newTrip.title || !newTrip.destination.name) {
      setError('Trip title and destination are required');
      return;
    }

    try {
      const response = await fetch('/api/social/group-trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newTrip)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowCreateTrip(false);
        setNewTrip({
          title: '',
          description: '',
          destination: { name: '', country: '' },
          dates: { startDate: '', endDate: '', flexible: false },
          budget: { min: 0, max: 0, currency: 'USD' },
          capacity: { min: 2, max: 10 },
          tags: []
        });
        fetchGroupTrips(); // Refresh trips
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to create trip');
      console.error('Error creating trip:', error);
    }
  };

  const handleJoinTrip = async (tripId: string) => {
    try {
      const response = await fetch(`/api/social/group-trips/${tripId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ preferences: {} })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`Trip join result: ${data.message}`);
        fetchGroupTrips(); // Refresh trips
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to join trip');
      console.error('Error joining trip:', error);
    }
  };

  // Effects
  useEffect(() => {
    fetchUserProfile();
    fetchTrendingDestinations();
  }, [fetchUserProfile, fetchTrendingDestinations]);

  useEffect(() => {
    if (activeTab === 'feed') {
      fetchFeed();
    } else if (activeTab === 'groups') {
      fetchGroupTrips();
    } else if (activeTab === 'companions') {
      fetchCompanions();
    } else if (activeTab === 'discover') {
      fetchRecommendations('posts');
    }
  }, [activeTab, fetchFeed, fetchGroupTrips, fetchCompanions, fetchRecommendations]);

  // Component functions
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTravelTypeIcon = (type: string) => {
    switch (type) {
      case 'solo': return <Users className="w-4 h-4" />;
      case 'couple': return <Heart className="w-4 h-4" />;
      case 'family': return <Users className="w-4 h-4" />;
      case 'group': return <Users className="w-4 h-4" />;
      default: return <Plane className="w-4 h-4" />;
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Globe className="w-8 h-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Travel Social</h1>
              </div>
              
              {/* Search Bar */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search posts, places, people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                />
              </div>
            </div>

            {/* User Profile */}
            {userProfile && (
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-2">
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.fullName}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {userProfile.fullName}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'feed', label: 'Feed', icon: TrendingUp },
              { id: 'discover', label: 'Discover', icon: Search },
              { id: 'groups', label: 'Group Trips', icon: Users },
              { id: 'companions', label: 'Find Companions', icon: UserPlus }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mx-4 mt-4"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <p className="text-red-800">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* User Profile Card */}
              {userProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                  <div className="text-center">
                    <img
                      src={userProfile.avatar}
                      alt={userProfile.fullName}
                      className="w-20 h-20 rounded-full mx-auto mb-4"
                    />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {userProfile.fullName}
                    </h3>
                    <p className="text-gray-600 text-sm">@{userProfile.username}</p>
                    <p className="text-gray-500 text-sm mt-2">{userProfile.bio}</p>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatNumber(userProfile.stats.posts)}
                        </div>
                        <div className="text-xs text-gray-500">Posts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatNumber(userProfile.stats.followers)}
                        </div>
                        <div className="text-xs text-gray-500">Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {userProfile.stats.visitedCountries}
                        </div>
                        <div className="text-xs text-gray-500">Countries</div>
                      </div>
                    </div>

                    {/* Travel Score */}
                    <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <div className="flex items-center justify-center space-x-2">
                        <Award className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Travel Score</span>
                      </div>
                      <div className="text-xl font-bold text-blue-600 mt-1">
                        {userProfile.stats.travelScore}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Trending Destinations */}
              {trendingDestinations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Trending Destinations
                  </h3>
                  <div className="space-y-3">
                    {trendingDestinations.slice(0, 5).map((destination, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">
                                {index + 1}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {destination._id}
                            </div>
                            <div className="text-xs text-gray-500">
                              {destination.count} posts
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3 text-red-500" />
                          <span className="text-xs text-gray-500">
                            {formatNumber(destination.totalLikes)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {/* Placeholder for content tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Travel Social Network
              </h3>
              <p className="text-gray-600">
                Connect with fellow travelers, share your experiences, and discover amazing destinations together.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SocialTravelNetwork;
