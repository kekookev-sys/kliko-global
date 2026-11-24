// In-memory seed data for the kliko-global marketplace demo.
// Kept intentionally small: a freelancer pool and a few open tasks.

export function seedFreelancers() {
  return [
    {
      id: 'fl-001',
      name: 'Amara Okafor',
      headline: 'Full-stack engineer, marketplace APIs',
      skills: ['node.js', 'typescript', 'postgresql', 'api design'],
      ratePerHour: 68,
      rating: 4.9,
      country: 'Nigeria',
      completedTasks: 132
    },
    {
      id: 'fl-002',
      name: 'Lucas Meyer',
      headline: 'Product designer, conversion focused',
      skills: ['ui design', 'figma', 'design systems', 'user research'],
      ratePerHour: 55,
      rating: 4.8,
      country: 'Germany',
      completedTasks: 98
    },
    {
      id: 'fl-003',
      name: 'Priya Raman',
      headline: 'Data engineer, matching and ranking',
      skills: ['python', 'ranking', 'postgresql', 'machine learning'],
      ratePerHour: 74,
      rating: 4.9,
      country: 'India',
      completedTasks: 141
    },
    {
      id: 'fl-004',
      name: 'Diego Santos',
      headline: 'Frontend developer, React interfaces',
      skills: ['react', 'typescript', 'css', 'accessibility'],
      ratePerHour: 48,
      rating: 4.6,
      country: 'Brazil',
      completedTasks: 76
    },
    {
      id: 'fl-005',
      name: 'Nora Lindqvist',
      headline: 'Growth copywriter and content strategist',
      skills: ['copywriting', 'seo', 'content strategy'],
      ratePerHour: 42,
      rating: 4.7,
      country: 'Sweden',
      completedTasks: 64
    },
    {
      id: 'fl-006',
      name: 'Kenji Watanabe',
      headline: 'Mobile engineer, cross-platform',
      skills: ['react native', 'typescript', 'api design'],
      ratePerHour: 62,
      rating: 4.5,
      country: 'Japan',
      completedTasks: 51
    }
  ];
}

export function seedTasks() {
  return [
    {
      id: 'tk-001',
      title: 'Build a freelancer ranking endpoint',
      description: 'Score freelancers against a posted task using skills, budget and rating.',
      skills: ['node.js', 'ranking', 'postgresql'],
      budget: 900,
      client: 'Kliko Operations',
      status: 'open',
      createdAt: '2026-01-08T09:00:00.000Z'
    },
    {
      id: 'tk-002',
      title: 'Redesign the task posting flow',
      description: 'Simplify the three-step task form and improve mobile conversion.',
      skills: ['ui design', 'figma'],
      budget: 600,
      client: 'Northwind Studio',
      status: 'open',
      createdAt: '2026-01-09T14:30:00.000Z'
    }
  ];
}
