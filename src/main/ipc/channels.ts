export const CHANNELS = {
  activities: {
    list: 'activities:list',
    create: 'activities:create',
    update: 'activities:update',
    archive: 'activities:archive',
    delete: 'activities:delete',
    reorder: 'activities:reorder'
  },
  logEntries: {
    listByRange: 'logEntries:listByRange',
    aggregateByRange: 'logEntries:aggregateByRange',
    quickAdd: 'logEntries:quickAdd',
    update: 'logEntries:update',
    undoLast: 'logEntries:undoLast',
    delete: 'logEntries:delete'
  },
  stats: {
    totalsPerActivity: 'stats:totalsPerActivity',
    streak: 'stats:streak'
  },
  plans: {
    list: 'plans:list',
    create: 'plans:create',
    update: 'plans:update',
    delete: 'plans:delete',
    skipOccurrence: 'plans:skipOccurrence',
    unskipOccurrence: 'plans:unskipOccurrence'
  },
  dayNotes: {
    listByRange: 'dayNotes:listByRange',
    upsert: 'dayNotes:upsert',
    delete: 'dayNotes:delete'
  },
  app: {
    getTheme: 'app:getTheme',
    setTheme: 'app:setTheme',
    getDockIconStyle: 'app:getDockIconStyle',
    setDockIconStyle: 'app:setDockIconStyle'
  }
} as const
