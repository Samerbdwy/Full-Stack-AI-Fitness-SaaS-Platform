// Fixed: src/pages/ExerciseLibrary.tsx
import { motion } from 'framer-motion';
import { Search, Play, Heart, Filter, Dumbbell, ArrowDown, Zap, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

const ExerciseLibrary = () => {
  const [exercises, setExercises] = useState([
    {
      id: 1,
      name: 'Bench Press',
      category: 'Push',
      muscles: 'Chest, Triceps, Shoulders',
      difficulty: 'Intermediate',
      equipment: 'Barbell, Bench',
      type: 'Compound',
      youtubeUrl: 'https://www.youtube.com/watch?v=vcBig73ojpE',
      isLoved: false,
      order: 1
    },
    {
      id: 2,
      name: 'Overhead Press',
      category: 'Push', 
      muscles: 'Shoulders, Triceps',
      difficulty: 'Intermediate',
      equipment: 'Barbell',
      type: 'Compound',
      youtubeUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
      isLoved: false,
      order: 2
    },
    {
      id: 3,
      name: 'Incline Dumbbell Press',
      category: 'Push',
      muscles: 'Upper Chest, Shoulders',
      difficulty: 'Intermediate', 
      equipment: 'Dumbbells, Bench',
      type: 'Compound',
      youtubeUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
      isLoved: false,
      order: 3
    },
    {
      id: 4,
      name: 'Pull-ups',
      category: 'Pull',
      muscles: 'Back, Biceps',
      difficulty: 'Advanced',
      equipment: 'Pull-up Bar',
      type: 'Compound',
      youtubeUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
      isLoved: false,
      order: 4
    },
    {
      id: 5,
      name: 'Barbell Rows',
      category: 'Pull',
      muscles: 'Back, Biceps',
      difficulty: 'Intermediate',
      equipment: 'Barbell',
      type: 'Compound',
      youtubeUrl: 'https://www.youtube.com/watch?v=9efgcAjQe7E',
      isLoved: false,
      order: 5
    },
    {
      id: 6,
      name: 'Lat Pulldowns',
      category: 'Pull',
      muscles: 'Lats, Biceps', 
      difficulty: 'Beginner',
      equipment: 'Cable Machine',
      type: 'Compound',
      youtubeUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
      isLoved: false,
      order: 6
    },
    {
      id: 7,
      name: 'Squats',
      category: 'Legs',
      muscles: 'Quads, Glutes, Hamstrings',
      difficulty: 'Intermediate',
      equipment: 'Barbell',
      type: 'Compound',
      youtubeUrl: 'https://www.youtube.com/watch?v=Dy28eq2PjcM',
      isLoved: false,
      order: 7
    },
    {
      id: 8,
      name: 'Romanian Deadlifts',
      category: 'Legs',
      muscles: 'Hamstrings, Glutes',
      difficulty: 'Intermediate',
      equipment: 'Barbell',
      type: 'Compound',
      youtubeUrl: 'https://www.youtube.com/watch?v=JCXUYuzwNrM',
      isLoved: false,
      order: 8
    },
    {
      id: 9,
      name: 'Leg Press',
      category: 'Legs',
      muscles: 'Quads, Glutes',
      difficulty: 'Beginner',
      equipment: 'Leg Press Machine',
      type: 'Compound',
      youtubeUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
      isLoved: false,
      order: 9
    },
    {
      id: 10,
      name: 'Lateral Raises',
      category: 'Push',
      muscles: 'Shoulders',
      difficulty: 'Beginner',
      equipment: 'Dumbbells',
      type: 'Isolation',
      youtubeUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
      isLoved: false,
      order: 10
    },
    {
      id: 11,
      name: 'Face Pulls',
      category: 'Pull',
      muscles: 'Rear Delts, Upper Back',
      difficulty: 'Beginner',
      equipment: 'Cable Machine',
      type: 'Isolation',
      youtubeUrl: 'https://www.youtube.com/watch?v=0Po47vvj9g4',
      isLoved: false,
      order: 11
    },
    {
      id: 12,
      name: 'Leg Extensions',
      category: 'Legs',
      muscles: 'Quads',
      difficulty: 'Beginner',
      equipment: 'Machine',
      type: 'Isolation',
      youtubeUrl: 'https://www.youtube.com/watch?v=YyvSfVjQeL0',
      isLoved: false,
      order: 12
    }
  ]);

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All Difficulties');

  // Load loved exercises from localStorage on component mount
  useEffect(() => {
    const savedLovedExercises = localStorage.getItem('lovedExercises');
    if (savedLovedExercises) {
      const lovedIds = JSON.parse(savedLovedExercises);
      setExercises(prev => prev.map(exercise => ({
        ...exercise,
        isLoved: lovedIds.includes(exercise.id)
      })));
    }
  }, []);

  const pplExplanations = {
    push: {
      title: "PUSH DAY",
      icon: <Zap className="w-6 h-6" />, // Changed from ArrowUp to Zap
      color: "text-savage-neon-orange",
      bgColor: "bg-savage-neon-orange/10",
      borderColor: "border-savage-neon-orange/20",
      description: "Exercises where you PUSH weight away from your body",
      muscleGroups: [
        "Chest (Pectorals)",
        "Shoulders (Deltoids)", 
        "Triceps",
        "Front Delts"
      ],
      examples: "Bench Press, Shoulder Press, Push-ups, Tricep Extensions"
    },
    pull: {
      title: "PULL DAY", 
      icon: <ArrowDown className="w-6 h-6" />,
      color: "text-savage-neon-blue",
      bgColor: "bg-savage-neon-blue/10",
      borderColor: "border-savage-neon-blue/20",
      description: "Exercises where you PULL weight toward your body",
      muscleGroups: [
        "Upper Back (Lats, Rhomboids)",
        "Lower Back",
        "Biceps", 
        "Rear Delts",
        "Traps"
      ],
      examples: "Pull-ups, Rows, Deadlifts, Bicep Curls"
    },
    legs: {
      title: "LEGS DAY",
      icon: <Zap className="w-6 h-6" />,
      color: "text-savage-neon-green", 
      bgColor: "bg-savage-neon-green/10",
      borderColor: "border-savage-neon-green/20",
      description: "Exercises targeting your lower body",
      muscleGroups: [
        "Quadriceps (Front Thighs)",
        "Hamstrings (Back Thighs)",
        "Glutes (Butt)",
        "Calves",
        "Hip Flexors"
      ],
      examples: "Squats, Lunges, Leg Press, Calf Raises"
    }
  };

  // Filter exercises based on search and filters
  const filteredExercises = exercises
    .filter(exercise => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exercise.muscles.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All Categories' || exercise.category === selectedCategory;
      const matchesType = selectedType === 'All Types' || exercise.type === selectedType;
      const matchesDifficulty = selectedDifficulty === 'All Difficulties' || exercise.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesType && matchesDifficulty;
    })
    .sort((a, b) => {
      // Loved exercises first, then by order
      if (a.isLoved && !b.isLoved) return -1;
      if (!a.isLoved && b.isLoved) return 1;
      return a.order - b.order;
    });

  // Handle love button click - saves to localStorage
  const handleLoveClick = (id: number) => {
    setExercises(prevExercises => {
      const updatedExercises = prevExercises.map(exercise => 
        exercise.id === id 
          ? { ...exercise, isLoved: !exercise.isLoved }
          : exercise
      );
      
      // Save loved exercise IDs to localStorage
      const lovedIds = updatedExercises
        .filter(ex => ex.isLoved)
        .map(ex => ex.id);
      localStorage.setItem('lovedExercises', JSON.stringify(lovedIds));
      
      return updatedExercises;
    });
  };

  // Handle view demo (YouTube redirect)
  const handleViewDemo = (youtubeUrl: string) => {
    window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
  };

  // Apply filters
  const handleApplyFilters = () => {
    // Filters are applied automatically through the filteredExercises computation
    console.log('Filters applied:', { selectedCategory, selectedType, selectedDifficulty });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Push': return 'text-savage-neon-orange';
      case 'Pull': return 'text-savage-neon-blue'; 
      case 'Legs': return 'text-savage-neon-green';
      default: return 'text-gray-400';
    }
  };

  const getCategoryBg = (category: string) => {
    switch (category) {
      case 'Push': return 'bg-savage-neon-orange/20 border-savage-neon-orange/30';
      case 'Pull': return 'bg-savage-neon-blue/20 border-savage-neon-blue/30';
      case 'Legs': return 'bg-savage-neon-green/20 border-savage-neon-green/30';
      default: return 'bg-gray-800 border-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'Compound' ? 
      <Zap className="w-4 h-4 text-savage-neon-orange" /> : 
      <Dumbbell className="w-4 h-4 text-savage-neon-blue" />;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-2"
      >
        Exercise Library
      </motion.h1>
      <p className="text-gray-400 mb-8">Push • Pull • Legs split exercises</p>

      {/* PPL Explanation Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-savage-neon-purple" />
          <h2 className="text-xl font-bold text-white">Understanding PPL Split</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(pplExplanations).map(([key, data]) => (
            <motion.div
              key={key}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-xl border-2 ${data.bgColor} ${data.borderColor}`}
            >
              <div className="flex items-center gap-3">
                <div className={data.color}>
                  {data.icon}
                </div>
                <h3 className={`font-bold text-lg ${data.color}`}>
                  {data.title}
                </h3>
              </div>
              
              <p className="text-sm text-gray-300 mt-3">{data.description}</p>
              
              <div className="mt-3">
                <h4 className="text-white text-sm font-semibold mb-2">Targets:</h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  {data.muscleGroups.map((muscle, idx) => (
                    <li key={idx}>• {muscle}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-3">
                <h4 className="text-white text-sm font-semibold mb-1">Examples:</h4>
                <p className="text-xs text-gray-400">{data.examples}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-savage-black/50 p-4 rounded-lg border border-gray-700">
          <h4 className="text-savage-neon-purple font-semibold mb-2">💡 Pro Tip:</h4>
          <p className="text-sm text-gray-300">
            Follow the PPL split by training each muscle group 2x per week. Example: Push on Monday/Thursday, Pull on Tuesday/Friday, Legs on Wednesday/Saturday.
          </p>
        </div>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-savage-steel p-6 rounded-xl border border-gray-800 mb-8"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-savage-black border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-savage-neon-blue focus:outline-none"
            />
          </div>
          
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-savage-black border border-gray-700 rounded-lg px-4 py-3 text-white"
          >
            <option>All Categories</option>
            <option>Push</option>
            <option>Pull</option>
            <option>Legs</option>
          </select>

          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-savage-black border border-gray-700 rounded-lg px-4 py-3 text-white"
          >
            <option>All Types</option>
            <option>Compound</option>
            <option>Isolation</option>
          </select>

          <select 
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-savage-black border border-gray-700 rounded-lg px-4 py-3 text-white"
          >
            <option>All Difficulties</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>

          <button 
            onClick={handleApplyFilters}
            className="bg-savage-neon-blue text-savage-black font-bold px-6 rounded-lg hover:bg-cyan-400 transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </motion.div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-savage-steel rounded-xl border border-gray-800 overflow-hidden hover:border-savage-neon-blue transition-all duration-300 group relative ${
              exercise.isLoved ? 'ring-2 ring-red-500' : ''
            }`}
          >
            {/* Exercise Header */}
            <div className={`p-4 border-b border-gray-800 ${getCategoryBg(exercise.category)}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg group-hover:text-savage-neon-blue transition-colors">
                    {exercise.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm font-semibold ${getCategoryColor(exercise.category)}`}>
                      {exercise.category}
                    </span>
                    <span className="text-gray-400">•</span>
                    {getTypeIcon(exercise.type)}
                    <span className="text-xs text-gray-400">{exercise.type}</span>
                  </div>
                </div>
                {/* Simple love button - just turns red, no badge */}
                <button 
                  onClick={() => handleLoveClick(exercise.id)}
                  className={`transition-colors ${
                    exercise.isLoved 
                      ? 'text-red-500' 
                      : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className="w-5 h-5" fill={exercise.isLoved ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            {/* Exercise Details */}
            <div className="p-4">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Muscles:</span>
                  <span className="text-white font-medium text-right">{exercise.muscles}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Difficulty:</span>
                  <span className={`font-medium ${
                    exercise.difficulty === 'Beginner' ? 'text-savage-neon-green' :
                    exercise.difficulty === 'Intermediate' ? 'text-savage-neon-orange' :
                    'text-savage-neon-blue'
                  }`}>
                    {exercise.difficulty}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Equipment:</span>
                  <span className="text-white font-medium">{exercise.equipment}</span>
                </div>
              </div>

              {/* Action Buttons - Single centered View Demo button */}
              <div className="flex">
                <button 
                  onClick={() => handleViewDemo(exercise.youtubeUrl)}
                  className="flex-1 bg-savage-neon-blue text-savage-black font-bold py-2 rounded-lg hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  View Demo
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* No Results Message */}
      {filteredExercises.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">No exercises found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </motion.div>
      )}
    </div>
  );
};

export default ExerciseLibrary;