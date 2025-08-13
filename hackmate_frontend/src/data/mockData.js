export const mockHackathons = [
  {
    id: '1',
    title: 'TechCrunch Disrupt Hackathon',
    description: 'Build the next big thing in 48 hours. Categories include AI/ML, FinTech, HealthTech, and more.',
    startDate: '2024-03-15T09:00:00Z',
    endDate: '2024-03-17T18:00:00Z',
    registrationDeadline: '2024-03-10T23:59:59Z',
    location: 'San Francisco, CA',
    type: 'hybrid',
    tags: ['AI/ML', 'FinTech', 'HealthTech'],
    maxTeamSize: 4,
    prizePool: '$100,000',
    organizer: 'TechCrunch',
    participants: 450,
    teamsFormed: 112,
    image: 'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '2',
    title: 'Global Climate Hackathon',
    description: 'Develop innovative solutions to combat climate change and promote sustainability.',
    startDate: '2024-03-22T10:00:00Z',
    endDate: '2024-03-24T16:00:00Z',
    registrationDeadline: '2024-03-18T23:59:59Z',
    location: 'Online',
    type: 'online',
    tags: ['Sustainability', 'IoT', 'Data Science'],
    maxTeamSize: 5,
    prizePool: '$75,000',
    organizer: 'Green Tech Alliance',
    participants: 280,
    teamsFormed: 70,
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '3',
    title: 'HealthTech Innovation Challenge',
    description: 'Transform healthcare through technology. Focus on patient care, medical devices, and digital health.',
    startDate: '2024-04-05T09:00:00Z',
    endDate: '2024-04-07T17:00:00Z',
    registrationDeadline: '2024-04-01T23:59:59Z',
    location: 'Boston, MA',
    type: 'in-person',
    tags: ['HealthTech', 'Mobile Apps', 'Wearables'],
    maxTeamSize: 4,
    prizePool: '$50,000',
    organizer: 'MedTech Boston',
    participants: 320,
    teamsFormed: 80,
    image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
];

export const mockParticipants = [
  {
    id: '2',
    name: 'Sarah Chen',
    avatar: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    skills: ['Python', 'Machine Learning', 'Data Science', 'TensorFlow'],
    interests: ['AI/ML', 'Data Analytics', 'Research'],
    experience: 'advanced',
    bio: 'ML researcher with 5+ years experience in deep learning and computer vision.',
    rating: 4.9,
    location: 'San Francisco, CA',
    github: 'sarahchen',
    compatibility: 92,
    commonSkills: ['Python', 'Machine Learning'],
    complementarySkills: ['Data Science', 'Research Methods']
  },
  {
    id: '3',
    name: 'Marcus Rodriguez',
    avatar: 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
    interests: ['Frontend', 'Full-Stack', 'UI/UX'],
    experience: 'intermediate',
    bio: 'Full-stack developer passionate about creating beautiful user experiences.',
    rating: 4.7,
    location: 'Austin, TX',
    github: 'marcusr',
    compatibility: 88,
    commonSkills: ['React', 'Node.js'],
    complementarySkills: ['TypeScript', 'UI/UX Design']
  },
  {
    id: '4',
    name: 'Emily Foster',
    avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    skills: ['Figma', 'Sketch', 'Prototyping', 'User Research'],
    interests: ['UI/UX', 'Design Systems', 'Product Design'],
    experience: 'intermediate',
    bio: 'Product designer with a focus on user-centered design and accessibility.',
    rating: 4.8,
    location: 'Seattle, WA',
    github: 'emilyf',
    compatibility: 85,
    commonSkills: [],
    complementarySkills: ['UI/UX Design', 'User Research', 'Prototyping']
  },
  {
    id: '5',
    name: 'David Kim',
    avatar: 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    skills: ['Java', 'Spring Boot', 'Microservices', 'Docker'],
    interests: ['Backend', 'DevOps', 'System Architecture'],
    experience: 'advanced',
    bio: 'Senior backend engineer with expertise in scalable system design.',
    rating: 4.6,
    location: 'New York, NY',
    github: 'davidkim',
    compatibility: 79,
    commonSkills: [],
    complementarySkills: ['Backend Development', 'System Architecture', 'DevOps']
  }
];

export const mockTeams = [
  {
    id: '1',
    name: 'AI Innovators',
    hackathon: 'TechCrunch Disrupt Hackathon',
    members: [
      { id: '1', name: 'Alex Johnson', role: 'Team Lead', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' },
      { id: '2', name: 'Sarah Chen', role: 'ML Engineer', avatar: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' }
    ],
    lookingFor: ['Frontend Developer', 'UI/UX Designer'],
    skills: ['Python', 'React', 'Machine Learning', 'Data Science'],
    description: 'Building an AI-powered productivity assistant for developers.',
    status: 'looking',
    created: '2024-02-10T14:30:00Z'
  }
];

export const mockMessages = [
  {
    id: '1',
    userId: '2',
    userName: 'Sarah Chen',
    avatar: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    content: 'Hey team! I just finished the initial ML model architecture. Ready for review.',
    timestamp: '2024-02-11T10:30:00Z',
    type: 'text'
  },
  {
    id: '2',
    userId: '1',
    userName: 'Alex Johnson',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    content: 'Awesome work! I\'ll take a look after I finish the API endpoints. Should we schedule a quick sync?',
    timestamp: '2024-02-11T10:45:00Z',
    type: 'text'
  },
  {
    id: '3',
    userId: '2',
    userName: 'Sarah Chen',
    avatar: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    content: 'Sure! How about 2 PM today? I can walk through the model performance metrics.',
    timestamp: '2024-02-11T11:00:00Z',
    type: 'text'
  }
];