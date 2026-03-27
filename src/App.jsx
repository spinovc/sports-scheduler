import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';

// Theme system
const t = (dark) => ({
  bg: dark ? '#0f172a' : '#ffffff',
  card: dark ? '#1e293b' : '#f8fafc',
  text: dark ? '#f1f5f9' : '#1e293b',
  textMuted: dark ? '#94a3b8' : '#64748b',
  cardBorder: dark ? '#334155' : '#e2e8f0',
  inputBg: dark ? '#0f172a' : '#ffffff',
  inputBorder: dark ? '#475569' : '#cbd5e1',
  rowBg: dark ? '#0f172a' : '#f8fafc',
  highlight: dark ? '#3b82f6' : '#3b82f6',
  warning: dark ? '#f97316' : '#f97316',
  warningBorder: dark ? '#ea580c' : '#ea580c',
  headerBg: dark ? '#1e293b' : '#ffffff',
  tabBg: dark ? '#334155' : '#e2e8f0',
  tabActive: dark ? '#3b82f6' : '#3b82f6',
});

// Main App Component
export default function SportsSchedulerApp() {
  const [dark, setDark] = useState(false);
  const theme = t(dark);

  // Main state
  const [venues, setVenues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [rivalries, setRivalries] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [savedSeasons, setSavedSeasons] = useState([]);
  const [archivedSeasons, setArchivedSeasons] = useState([]);
  const [referees, setReferees] = useState([]);
  const [gameScores, setGameScores] = useState({});
  const [gameNotes, setGameNotes] = useState({});
  const [gameRefAssignments, setGameRefAssignments] = useState({});

  // Scheduling config
  const [gamesPerTeamPerDiv, setGamesPerTeamPerDiv] = useState(2);
  const [gamesPerTeamOtherDiv, setGamesPerTeamOtherDiv] = useState(1);
  const [allowDoubleHeaders, setAllowDoubleHeaders] = useState(false);
  const [scheduleStartDate, setScheduleStartDate] = useState('2025-01-01');
  const [scheduleEndDate, setScheduleEndDate] = useState('2025-04-30');

  // UI state
  const [activeTab, setActiveTab] = useState('welcome');
  const [dark, setDark] = useState(false);
  const [teamFilter, setTeamFilter] = useState(null);
  const [selectedTeamPortal, setSelectedTeamPortal] = useState(null);
  const [stateHistory, setStateHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Travel partners
  const [travelPartners, setTravelPartners] = useState([]);

  const theme = t(dark);

  // Save state to history (undo/redo)
  const saveToHistory = useCallback(() => {
    const currentState = { venues, teams, divisions, rivalries, schedule, travelPartners };
    setStateHistory((prev) => [...prev.slice(0, historyIndex + 1), currentState]);
    setHistoryIndex((prev) => prev + 1);
  }, [venues, teams, divisions, rivalries, schedule, travelPartners, historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = stateHistory[newIndex];
      setVenues(state.venues);
      setTeams(state.teams);
      setDivisions(state.divisions);
      setRivalries(state.rivalries);
      setSchedule(state.schedule);
      setTravelPartners(state.travelPartners);
      setHistoryIndex(newIndex);
    }
  }, [historyIndex, stateHistory]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < stateHistory.length - 1) {
      const newIndex = historyIndex + 1;
      const state = stateHistory[newIndex];
      setVenues(state.venues);
      setTeams(state.teams);
      setDivisions(state.divisions);
      setRivalries(state.rivalries);
      setSchedule(state.schedule);
      setTravelPartners(state.travelPartners);
      setHistoryIndex(newIndex);
    }
  }, [historyIndex, stateHistory]);

  const hasData = venues.length > 0 && teams.length > 0;
  const initialTab = hasData ? 'schedule' : 'welcome';

  useEffect(() => {
    if (activeTab === 'welcome' && !hasData) return;
    if (activeTab === 'welcome' && hasData) {
      setActiveTab(initialTab);
    }
  }, [hasData, activeTab, initialTab]);

  // ============= DEMO DATA =============
  const loadDemo = () => {
    const demoVenues = [
      { id: '1', name: 'Stadium A', capacity: 5000, timeSlots: ['10:00', '14:00', '18:00', '20:00'], primeTimeSlots: ['18:00', '20:00'], blackoutDates: ['2025-01-01'] },
      { id: '2', name: 'Stadium B', capacity: 3000, timeSlots: ['10:00', '14:00', '18:00'], primeTimeSlots: ['18:00'], blackoutDates: [] },
      { id: '3', name: 'Arena C', capacity: 2000, timeSlots: ['19:00', '21:00'], primeTimeSlots: ['19:00', '21:00'], blackoutDates: ['2025-02-14'] },
    ];

    const demoTeams = [
      { id: 'eagles', name: 'Eagles', color: '#004225', preferredVenues: ['1', '2'], blackoutDates: [], division: 'North' },
      { id: 'falcons', name: 'Falcons', color: '#a71930', preferredVenues: ['2', '3'], blackoutDates: [], division: 'North' },
      { id: 'lions', name: 'Lions', color: '#0076b6', preferredVenues: ['1'], blackoutDates: [], division: 'South' },
      { id: 'tigers', name: 'Tigers', color: '#ff6600', preferredVenues: ['3'], blackoutDates: [], division: 'South' },
    ];

    const demoDivisions = [
      { id: 'north', name: 'North', teams: ['eagles', 'falcons'] },
      { id: 'south', name: 'South', teams: ['lions', 'tigers'] },
    ];

    const demoRivalries = [
      { team1: 'eagles', team2: 'lions', intensity: 'high' },
    ];

    const demoReferees = [
      { id: 'ref1', name: 'John Smith', experience: 'high' },
      { id: 'ref2', name: 'Jane Doe', experience: 'medium' },
      { id: 'ref3', name: 'Bob Johnson', experience: 'high' },
    ];

    setVenues(demoVenues);
    setTeams(demoTeams);
    setDivisions(demoDivisions);
    setRivalries(demoRivalries);
    setReferees(demoReferees);
    setActiveTab('venues');
    saveToHistory();
  };

  // ============= VENUE FUNCTIONS =============
  const addVenue = (name, capacity, timeSlots, primeTimeSlots) => {
    const newVenue = {
      id: String(Date.now()),
      name,
      capacity,
      timeSlots,
      primeTimeSlots: primeTimeSlots || [],
      blackoutDates: [],
    };
    setVenues([...venues, newVenue]);
    saveToHistory();
  };

  const updateVenue = (id, updates) => {
    setVenues(venues.map((v) => (v.id === id ? { ...v, ...updates } : v)));
    saveToHistory();
  };

  const deleteVenue = (id) => {
    setVenues(venues.filter((v) => v.id !== id));
    saveToHistory();
  };

  // ============= TEAM FUNCTIONS =============
  const addTeam = (name, color, division, preferredVenues) => {
    const newTeam = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      color,
      division,
      preferredVenues,
      blackoutDates: [],
    };
    setTeams([...teams, newTeam]);
    saveToHistory();
  };

  const updateTeam = (id, updates) => {
    setTeams(teams.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    saveToHistory();
  };

  const deleteTeam = (id) => {
    setTeams(teams.filter((t) => t.id !== id));
    setDivisions(divisions.map((d) => ({ ...d, teams: d.teams.filter((t) => t !== id) })));
    saveToHistory();
  };

  // ============= DIVISION FUNCTIONS =============
  const addDivision = (name, teams) => {
    const newDiv = { id: String(Date.now()), name, teams };
    setDivisions([...divisions, newDiv]);
    saveToHistory();
  };

  const updateDivision = (id, updates) => {
    setDivisions(divisions.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    saveToHistory();
  };

  const deleteDivision = (id) => {
    setDivisions(divisions.filter((d) => d.id !== id));
    saveToHistory();
  };

  // ============= RIVALRY FUNCTIONS =============
  const addRivalry = (team1, team2, intensity) => {
    const newRivalry = { id: String(Date.now()), team1, team2, intensity };
    setRivalries([...rivalries, newRivalry]);
    saveToHistory();
  };

  const deleteRivalry = (id) => {
    setRivalries(rivalries.filter((r) => r.id !== id));
    saveToHistory();
  };

  // ============= REFEREE FUNCTIONS =============
  const addReferee = (name, experience) => {
    const newRef = { id: String(Date.now()), name, experience };
    setReferees([...referees, newRef]);
    saveToHistory();
  };

  const deleteReferee = (id) => {
    setReferees(referees.filter((r) => r.id !== id));
    saveToHistory();
  };

  // ============= SCHEDULE GENERATION =============
  const generateSchedule = () => {
    const newSchedule = [];
    const divisionMap = {};
    divisions.forEach((d) => {
      d.teams.forEach((t) => {
        divisionMap[t] = d.id;
      });
    });

    const start = new Date(scheduleStartDate);
    const end = new Date(scheduleEndDate);
    const dates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }

    const rivalryMap = {};
    rivalries.forEach((r) => {
      const key = [r.team1, r.team2].sort().join('-');
      rivalryMap[key] = r.intensity;
    });

    let gameId = 0;
    const gamesByTeam = {};
    teams.forEach((t) => {
      gamesByTeam[t.id] = [];
    });

    // Simple round-robin logic with constraints
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const team1 = teams[i];
        const team2 = teams[j];
        const inSameDivision = divisionMap[team1.id] === divisionMap[team2.id];
        const numGames = inSameDivision ? gamesPerTeamPerDiv : gamesPerTeamOtherDiv;
        const rivalryKey = [team1.id, team2.id].sort().join('-');
        const isRivalry = rivalryMap[rivalryKey];

        for (let g = 0; g < numGames; g++) {
          // Schedule team1 vs team2 (home at team1's venue)
          const homeVenueId = (team1.preferredVenues && team1.preferredVenues.length > 0)
            ? team1.preferredVenues[Math.floor(Math.random() * team1.preferredVenues.length)]
            : venues[0]?.id;

          const venue = venues.find((v) => v.id === homeVenueId);
          if (!venue) continue;

          const timeSlots = isRivalry && venue.primeTimeSlots && venue.primeTimeSlots.length > 0
            ? venue.primeTimeSlots
            : venue.timeSlots;

          const randomDate = dates[Math.floor(Math.random() * dates.length)];
          const dateStr = randomDate.toISOString().split('T')[0];
          const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];

          newSchedule.push({
            id: String(gameId++),
            homeTeam: team1.id,
            awayTeam: team2.id,
            venue: homeVenueId,
            date: dateStr,
            time: timeSlot,
            status: 'upcoming',
            homeScore: null,
            awayScore: null,
            byeWeek: false,
          });

          // Schedule team2 vs team1 (home at team2's venue)
          const homeVenueId2 = (team2.preferredVenues && team2.preferredVenues.length > 0)
            ? team2.preferredVenues[Math.floor(Math.random() * team2.preferredVenues.length)]
            : venues[0]?.id;

          const venue2 = venues.find((v) => v.id === homeVenueId2);
          if (!venue2) continue;

          const timeSlots2 = isRivalry && venue2.primeTimeSlots && venue2.primeTimeSlots.length > 0
            ? venue2.primeTimeSlots
            : venue2.timeSlots;

          const randomDate2 = dates[Math.floor(Math.random() * dates.length)];
          const dateStr2 = randomDate2.toISOString().split('T')[0];
          const timeSlot2 = timeSlots2[Math.floor(Math.random() * timeSlots2.length)];

          newSchedule.push({
            id: String(gameId++),
            homeTeam: team2.id,
            awayTeam: team1.id,
            venue: homeVenueId2,
            date: dateStr2,
            time: timeSlot2,
            status: 'upcoming',
            homeScore: null,
            awayScore: null,
            byeWeek: false,
          });
        }
      }
    }

    // Add bye weeks if odd number of teams
    if (teams.length % 2 === 1) {
      let byeId = gameId;
      teams.forEach((team) => {
        const randomDate = dates[Math.floor(Math.random() * dates.length)];
        const dateStr = randomDate.toISOString().split('T')[0];
        newSchedule.push({
          id: String(byeId++),
          homeTeam: team.id,
          awayTeam: null,
          venue: null,
          date: dateStr,
          time: '00:00',
          status: 'bye',
          byeWeek: true,
        });
      });
    }

    setSchedule(newSchedule.sort((a, b) => new Date(a.date) - new Date(b.date)));
    saveToHistory();
  };

  // ============= GAME OPERATIONS =============
  const updateGameScore = (gameId, homeScore, awayScore) => {
    setGameScores({ ...gameScores, [gameId]: { homeScore, awayScore } });
  };

  const markGameComplete = (gameId) => {
    setSchedule(
      schedule.map((g) =>
        g.id === gameId ? { ...g, status: 'completed' } : g
      )
    );
  };

  const addGameNote = (gameId, note) => {
    setGameNotes({ ...gameNotes, [gameId]: note });
  };

  const assignRefToGame = (gameId, refIds) => {
    setGameRefAssignments({ ...gameRefAssignments, [gameId]: refIds });
  };

  const swapGames = (gameId1, gameId2) => {
    const g1 = schedule.find((g) => g.id === gameId1);
    const g2 = schedule.find((g) => g.id === gameId2);
    if (!g1 || !g2) return;

    setSchedule(
      schedule.map((g) => {
        if (g.id === gameId1) return { ...g, date: g2.date, time: g2.time, venue: g2.venue };
        if (g.id === gameId2) return { ...g, date: g1.date, time: g1.time, venue: g1.venue };
        return g;
      })
    );
    saveToHistory();
  };

  // ============= TRAVEL PARTNERS =============
  const addTravelPartner = (team1, team2) => {
    const newPartner = { id: String(Date.now()), team1, team2 };
    setTravelPartners([...travelPartners, newPartner]);
    saveToHistory();
  };

  const deleteTravelPartner = (id) => {
    setTravelPartners(travelPartners.filter((t) => t.id !== id));
    saveToHistory();
  };

  // ============= EXPORT/IMPORT =============
  const exportSeason = (seasonName) => {
    const seasonData = {
      name: seasonName,
      timestamp: new Date().toISOString(),
      venues,
      teams,
      divisions,
      rivalries,
      schedule,
      referees,
      gameScores,
      gameNotes,
      gameRefAssignments,
      travelPartners,
    };

    const dataStr = JSON.stringify(seasonData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${seasonName}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setSavedSeasons([...savedSeasons, seasonData]);
  };

  const importSeason = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const seasonData = JSON.parse(e.target.result);
        setVenues(seasonData.venues || []);
        setTeams(seasonData.teams || []);
        setDivisions(seasonData.divisions || []);
        setRivalries(seasonData.rivalries || []);
        setSchedule(seasonData.schedule || []);
        setReferees(seasonData.referees || []);
        setGameScores(seasonData.gameScores || {});
        setGameNotes(seasonData.gameNotes || {});
        setGameRefAssignments(seasonData.gameRefAssignments || {});
        setTravelPartners(seasonData.travelPartners || []);
        setActiveTab('schedule');
        saveToHistory();
      } catch (err) {
        alert('Error importing file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const archiveSeason = (seasonName) => {
    const archivedData = {
      name: seasonName,
      timestamp: new Date().toISOString(),
      standings: calculateStandings(),
      schedule: schedule.filter((g) => g.status === 'completed'),
      teams: teams.map((t) => {
        const teamGames = schedule.filter((g) => (g.homeTeam === t.id || g.awayTeam === t.id) && g.status === 'completed');
        return { ...t, gamesPlayed: teamGames.length };
      }),
    };

    setArchivedSeasons([...archivedSeasons, archivedData]);
    setSchedule([]);
    setGameScores({});
    setGameNotes({});
    setGameRefAssignments({});
  };

  // ============= STANDINGS CALCULATION =============
  const calculateStandings = () => {
    const standings = teams.map((team) => {
      let wins = 0;
      let losses = 0;
      let streak = '';

      schedule.forEach((game) => {
        if (game.status !== 'completed') return;
        if (game.homeTeam === team.id) {
          if (gameScores[game.id]) {
            if (gameScores[game.id].homeScore > gameScores[game.id].awayScore) wins++;
            else losses++;
          }
        } else if (game.awayTeam === team.id) {
          if (gameScores[game.id]) {
            if (gameScores[game.id].awayScore > gameScores[game.id].homeScore) wins++;
            else losses++;
          }
        }
      });

      const pct = wins + losses > 0 ? (wins / (wins + losses)).toFixed(3) : '.000';
      const recentGames = schedule
        .filter((g) => (g.homeTeam === team.id || g.awayTeam === team.id) && g.status === 'completed')
        .slice(-5);

      let streakStr = '';
      if (recentGames.length > 0) {
        let count = 1;
        let lastWin = null;
        recentGames.reverse().forEach((game) => {
          if (gameScores[game.id]) {
            const isWin =
              (game.homeTeam === team.id && gameScores[game.id].homeScore > gameScores[game.id].awayScore) ||
              (game.awayTeam === team.id && gameScores[game.id].awayScore > gameScores[game.id].homeScore);
            if (lastWin === null) {
              lastWin = isWin;
            }
            if (isWin === lastWin) {
              count++;
            } else {
              streakStr = (lastWin ? 'W' : 'L') + count;
              return;
            }
          }
        });
        if (lastWin !== null && !streakStr) {
          streakStr = (lastWin ? 'W' : 'L') + count;
        }
      }

      return {
        team: team.name,
        teamId: team.id,
        wins,
        losses,
        pct,
        streak: streakStr,
        gamesBack: 0,
      };
    });

    standings.sort((a, b) => b.wins - a.wins);
    const maxWins = standings[0]?.wins || 0;
    standings.forEach((s) => {
      s.gamesBack = ((maxWins - s.wins) * 2) / 2;
    });

    return standings;
  };

  // ============= CALENDAR HEATMAP =============
  const generateCalendarHeatmap = () => {
    const heatmap = {};
    schedule.forEach((game) => {
      if (!heatmap[game.date]) {
        heatmap[game.date] = 0;
      }
      heatmap[game.date]++;
    });
    return heatmap;
  };

  // ============= VENUE UTILIZATION =============
  const calculateVenueUtilization = () => {
    const utilization = {};
    venues.forEach((v) => {
      utilization[v.id] = {
        name: v.name,
        totalSlots: v.timeSlots.length * 120, // rough estimate: 120 days
        usedSlots: 0,
      };
    });

    schedule.forEach((game) => {
      if (game.venue && utilization[game.venue]) {
        utilization[game.venue].usedSlots++;
      }
    });

    return utilization;
  };

  // ============= STRENGTH OF SCHEDULE =============
  const calculateStrengthOfSchedule = () => {
    const sos = {};
    teams.forEach((team) => {
      let totalWins = 0;
      let opponentCount = 0;

      schedule.forEach((game) => {
        let opponent = null;
        if (game.homeTeam === team.id) opponent = game.awayTeam;
        else if (game.awayTeam === team.id) opponent = game.homeTeam;

        if (opponent && opponent !== null) {
          const oppTeam = teams.find((t) => t.id === opponent);
          if (oppTeam) {
            const oppWins = calculateStandings().find((s) => s.teamId === opponent)?.wins || 0;
            totalWins += oppWins;
            opponentCount++;
          }
        }
      });

      sos[team.id] = {
        team: team.name,
        avgOpponentWins: opponentCount > 0 ? (totalWins / opponentCount).toFixed(2) : 0,
      };
    });

    return sos;
  };

  // ============= PLAYOFF BRACKET =============
  const generatePlayoffBracket = () => {
    const standings = calculateStandings();
    const divisionStandings = {};

    divisions.forEach((div) => {
      divisionStandings[div.id] = standings.filter((s) => {
        const t = teams.find((te) => te.id === s.teamId);
        return t && t.division === div.name;
      });
    });

    return divisionStandings;
  };

  // ============= CALCULATIONS & UTILS =============
  const heatmap = generateCalendarHeatmap();
  const venueUtil = calculateVenueUtilization();
  const strengthOfSchedule = calculateStrengthOfSchedule();
  const standings = calculateStandings();
  const playoffBracket = generatePlayoffBracket();

  // Filtered schedule
  const filteredSchedule = teamFilter
    ? schedule.filter((g) => g.homeTeam === teamFilter || g.awayTeam === teamFilter)
    : schedule;

  const getTeamName = (teamId) => teams.find((t) => t.id === teamId)?.name || teamId;
  const getTeamColor = (teamId) => teams.find((t) => t.id === teamId)?.color || '#888';
  const getVenueName = (venueId) => venues.find((v) => v.id === venueId)?.name || venueId;

  // ============= RENDER FUNCTIONS =============

  const renderWelcomeTab = () => (
    <div style={{ padding: '40px 20px', textAlign: 'center', minHeight: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ fontSize: '80px', marginBottom: '20px' }}>⚽</div>
      <h1 style={{ color: theme.text, fontSize: '36px', marginBottom: '10px' }}>Sports Schedule Optimizer</h1>
      <p style={{ color: theme.textMuted, fontSize: '16px', marginBottom: '40px', maxWidth: '600px' }}>
        Create, manage, and optimize sports schedules for your league. Start by loading demo data or begin with an empty season.
      </p>
      <div style={{ display: 'flex', gap: '20px' }}>
        <button
          onClick={() => {
            setActiveTab('venues');
          }}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: theme.highlight,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Get Started
        </button>
        <button
          onClick={loadDemo}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: theme.card,
            color: theme.text,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Load Demo Data
        </button>
      </div>
    </div>
  );

  const renderVenuesTab = () => (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: theme.text, marginBottom: '20px' }}>Venues</h2>
      <VenueManager venues={venues} addVenue={addVenue} updateVenue={updateVenue} deleteVenue={deleteVenue} theme={theme} />
    </div>
  );

  const renderTeamsTab = () => (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: theme.text, marginBottom: '20px' }}>Teams</h2>
      <TeamManager teams={teams} divisions={divisions} addTeam={addTeam} updateTeam={updateTeam} deleteTeam={deleteTeam} venues={venues} theme={theme} />
    </div>
  );

  const renderDivisionsTab = () => (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: theme.text, marginBottom: '20px' }}>Divisions & Rivalries</h2>
      <DivisionManager divisions={divisions} teams={teams} addDivision={addDivision} updateDivision={updateDivision} deleteDivision={deleteDivision} theme={theme} />
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ color: theme.text, marginBottom: '20px' }}>Rivalries</h3>
        <RivalryManager rivalries={rivalries} teams={teams} addRivalry={addRivalry} deleteRivalry={deleteRivalry} theme={theme} />
      </div>
    </div>
  );

  const renderConfigureTab = () => (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: theme.text, marginBottom: '20px' }}>Configure Season</h2>
      <div style={{ maxWidth: '600px' }}>
        <ConfigurePanel
          gamesPerTeamPerDiv={gamesPerTeamPerDiv}
          setGamesPerTeamPerDiv={setGamesPerTeamPerDiv}
          gamesPerTeamOtherDiv={gamesPerTeamOtherDiv}
          setGamesPerTeamOtherDiv={setGamesPerTeamOtherDiv}
          allowDoubleHeaders={allowDoubleHeaders}
          setAllowDoubleHeaders={setAllowDoubleHeaders}
          scheduleStartDate={scheduleStartDate}
          setScheduleStartDate={setScheduleStartDate}
          scheduleEndDate={scheduleEndDate}
          setScheduleEndDate={setScheduleEndDate}
          theme={theme}
        />
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button
            onClick={generateSchedule}
            style={{
              padding: '10px 20px',
              backgroundColor: theme.highlight,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Generate Schedule
          </button>
          <button
            onClick={() => setSchedule([])}
            style={{
              padding: '10px 20px',
              backgroundColor: theme.warning,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Clear Schedule
          </button>
        </div>
      </div>
    </div>
  );

  const renderScheduleTab = () => (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: theme.text, marginBottom: '20px' }}>Schedule</h2>
      <ScheduleView
        schedule={filteredSchedule}
        teams={teams}
        venues={venues}
        gameScores={gameScores}
        gameNotes={gameNotes}
        gameRefAssignments={gameRefAssignments}
        referees={referees}
        updateGameScore={updateGameScore}
        addGameNote={addGameNote}
        assignRefToGame={assignRefToGame}
        markGameComplete={markGameComplete}
        swapGames={swapGames}
        teamFilter={teamFilter}
        setTeamFilter={setTeamFilter}
        theme={theme}
      />
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ color: theme.text, marginBottom: '20px' }}>Calendar Heatmap</h3>
        <CalendarHeatmap heatmap={heatmap} scheduleStartDate={scheduleStartDate} scheduleEndDate={scheduleEndDate} theme={theme} />
      </div>
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ color: theme.text, marginBottom: '20px' }}>Venue Utilization</h3>
        <VenueUtilizationView utilization={venueUtil} theme={theme} />
      </div>
    </div>
  );

  const renderStandingsTab = () => (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: theme.text, marginBottom: '20px' }}>Standings</h2>
      <StandingsView standings={standings} theme={theme} />
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ color: theme.text, marginBottom: '20px' }}>Strength of Schedule</h3>
        <StrengthOfScheduleView sos={strengthOfSchedule} theme={theme} />
      </div>
    </div>
  );

  const renderTeamHubTab = () => (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: theme.text, marginBottom: '20px' }}>Team Hub</h2>
      <TeamHubView
        teams={teams}
        schedule={schedule}
        gameScores={gameScores}
        selectedTeamPortal={selectedTeamPortal}
        setSelectedTeamPortal={setSelectedTeamPortal}
        getTeamName={getTeamName}
        getVenueName={getVenueName}
        theme={theme}
      />
    </div>
  );

  const renderPlayoffsTab = () => (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: theme.text, marginBottom: '20px' }}>Playoff Bracket</h2>
      <PlayoffBracketView bracket={playoffBracket} divisions={divisions} theme={theme} />
    </div>
  );

  const renderRefsTab = () => (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: theme.text, marginBottom: '20px' }}>Referees & Officials</h2>
      <RefereeManager referees={referees} addReferee={addReferee} deleteReferee={deleteReferee} theme={theme} />
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ color: theme.text, marginBottom: '20px' }}>Referee Workload</h3>
        <RefereeWorkloadView gameRefAssignments={gameRefAssignments} referees={referees} theme={theme} />
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: theme.text, marginBottom: '20px' }}>Season History</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {archivedSeasons.length === 0 ? (
          <p style={{ color: theme.textMuted }}>No archived seasons yet.</p>
        ) : (
          archivedSeasons.map((season, idx) => (
            <div key={idx} style={{ padding: '15px', backgroundColor: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '4px' }}>
              <h4 style={{ color: theme.text, marginBottom: '10px' }}>{season.name}</h4>
              <p style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '10px' }}>
                {new Date(season.timestamp).toLocaleDateString()}
              </p>
              <p style={{ color: theme.textMuted, fontSize: '14px' }}>
                Games Played: {season.schedule.length}
              </p>
              <button
                onClick={() => {
                  setSchedule([]);
                  setGameScores({});
                }}
                style={{
                  marginTop: '10px',
                  padding: '8px 12px',
                  backgroundColor: theme.highlight,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                View Details
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const tabs = [
    { key: 'welcome', label: 'Welcome' },
    { key: 'venues', label: 'Venues' },
    { key: 'teams', label: 'Teams' },
    { key: 'divisions', label: 'Divisions' },
    { key: 'configure', label: 'Configure' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'standings', label: 'Standings' },
    { key: 'teamhub', label: 'Team Hub' },
    { key: 'playoffs', label: 'Playoffs' },
    { key: 'refs', label: 'Refs' },
    { key: 'history', label: 'History' },
  ];

  const visibleTabs = hasData ? tabs.filter((t) => t.key !== 'welcome') : tabs;

  return (
    <div style={{ backgroundColor: theme.bg, color: theme.text, minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* HEADER */}
      <div style={{ backgroundColor: theme.headerBg, borderBottom: `1px solid ${theme.cardBorder}`, padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>⚽ Sports Scheduler</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            style={{
              padding: '8px 12px',
              backgroundColor: historyIndex > 0 ? theme.highlight : theme.tabBg,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: historyIndex > 0 ? 'pointer' : 'not-allowed',
              opacity: historyIndex > 0 ? 1 : 0.5,
            }}
          >
            ↶ Undo
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= stateHistory.length - 1}
            style={{
              padding: '8px 12px',
              backgroundColor: historyIndex < stateHistory.length - 1 ? theme.highlight : theme.tabBg,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: historyIndex < stateHistory.length - 1 ? 'pointer' : 'not-allowed',
              opacity: historyIndex < stateHistory.length - 1 ? 1 : 0.5,
            }}
          >
            ↷ Redo
          </button>
          <button
            onClick={() => {
              const seasonName = prompt('Enter season name:', 'Season ' + new Date().getFullYear());
              if (seasonName) exportSeason(seasonName);
            }}
            style={{
              padding: '8px 12px',
              backgroundColor: theme.highlight,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            📥 Export
          </button>
          <label style={{ padding: '8px 12px', backgroundColor: theme.highlight, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-block' }}>
            📤 Import
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                if (e.target.files[0]) importSeason(e.target.files[0]);
              }}
              style={{ display: 'none' }}
            />
          </label>
          <button
            onClick={() => setDark(!dark)}
            style={{
              padding: '8px 12px',
              backgroundColor: theme.tabBg,
              color: theme.text,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ borderBottom: `1px solid ${theme.cardBorder}`, backgroundColor: theme.tabBg, display: 'flex', overflowX: 'auto' }}>
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '15px 20px',
              backgroundColor: activeTab === tab.key ? theme.tabActive : 'transparent',
              color: activeTab === tab.key ? 'white' : theme.textMuted,
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab.key ? '600' : '400',
              borderBottom: activeTab === tab.key ? `3px solid ${theme.tabActive}` : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {activeTab === 'welcome' && renderWelcomeTab()}
        {activeTab === 'venues' && renderVenuesTab()}
        {activeTab === 'teams' && renderTeamsTab()}
        {activeTab === 'divisions' && renderDivisionsTab()}
        {activeTab === 'configure' && renderConfigureTab()}
        {activeTab === 'schedule' && renderScheduleTab()}
        {activeTab === 'standings' && renderStandingsTab()}
        {activeTab === 'teamhub' && renderTeamHubTab()}
        {activeTab === 'playoffs' && renderPlayoffsTab()}
        {activeTab === 'refs' && renderRefsTab()}
        {activeTab === 'history' && renderHistoryTab()}
      </div>
    </div>
  );
}

// ============= COMPONENT: VENUE MANAGER =============
function VenueManager({ venues, addVenue, updateVenue, deleteVenue, theme }) {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [timeSlots, setTimeSlots] = useState('');
  const [primeSlots, setPrimeSlots] = useState('');
  const [editingId, setEditingId] = useState(null);

  const handleAdd = () => {
    if (!name || !capacity) return alert('Please fill all fields');
    addVenue(name, parseInt(capacity), timeSlots.split(',').map((s) => s.trim()), primeSlots.split(',').map((s) => s.trim()).filter(s => s));
    setName('');
    setCapacity('');
    setTimeSlots('');
    setPrimeSlots('');
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '4px' }}>
        <h3 style={{ marginTop: 0, color: theme.text }}>Add New Venue</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          <input
            type="text"
            placeholder="Venue Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: '10px',
              backgroundColor: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.inputBorder}`,
              borderRadius: '4px',
            }}
          />
          <input
            type="number"
            placeholder="Capacity"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            style={{
              padding: '10px',
              backgroundColor: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.inputBorder}`,
              borderRadius: '4px',
            }}
          />
          <input
            type="text"
            placeholder="Time Slots (comma-separated, e.g., 10:00, 14:00, 18:00)"
            value={timeSlots}
            onChange={(e) => setTimeSlots(e.target.value)}
            style={{
              padding: '10px',
              backgroundColor: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.inputBorder}`,
              borderRadius: '4px',
            }}
          />
          <input
            type="text"
            placeholder="Prime Time Slots (comma-separated, e.g., 18:00, 20:00)"
            value={primeSlots}
            onChange={(e) => setPrimeSlots(e.target.value)}
            style={{
              padding: '10px',
              backgroundColor: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.inputBorder}`,
              borderRadius: '4px',
            }}
          />
          <button
            onClick={handleAdd}
            style={{
              padding: '10px',
              backgroundColor: theme.highlight,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Add Venue
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
        {venues.map((venue) => (
          <div key={venue.id} style={{ padding: '15px', backgroundColor: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: theme.text }}>{venue.name}</h4>
            <p style={{ margin: '5px 0', color: theme.textMuted, fontSize: '14px' }}>Capacity: {venue.capacity}</p>
            <p style={{ margin: '5px 0', color: theme.textMuted, fontSize: '14px' }}>Slots: {venue.timeSlots.join(', ')}</p>
            <p style={{ margin: '5px 0', color: theme.textMuted, fontSize: '14px' }}>Prime: {venue.primeTimeSlots?.join(', ') || 'None'}</p>
            <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
              <button
                onClick={() => deleteVenue(venue.id)}
                style={{
                  padding: '6px 10px',
                  backgroundColor: theme.warning,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============= COMPONENT: TEAM MANAGER =============
function TeamManager({ teams, divisions, addTeam, updateTeam, deleteTeam, venues, theme }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#000000');
  const [division, setDivision] = useState('');
  const [preferredVenues, setPreferredVenues] = useState([]);

  const handleAdd = () => {
    if (!name || !division) return alert('Please fill all fields');
    addTeam(name, color, division, preferredVenues);
    setName('');
    setColor('#000000');
    setDivision('');
    setPreferredVenues([]);
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '4px' }}>
        <h3 style={{ marginTop: 0, color: theme.text }}>Add New Team</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          <input
            type="text"
            placeholder="Team Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: '10px',
              backgroundColor: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.inputBorder}`,
              borderRadius: '4px',
            }}
          />
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ color: theme.text }}>Team Color:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{
                padding: '5px',
                cursor: 'pointer',
                width: '50px',
                height: '40px',
                borderRadius: '4px',
                border: `1px solid ${theme.inputBorder}`,
              }}
            />
          </div>
          <select
            value={division}
            onChange={(e) => setDivision(e.target.value)}
            style={{
              padding: '10px',
              backgroundColor: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.inputBorder}`,
              borderRadius: '4px',
            }}
          >
            <option value="">Select Division</option>
            {['North', 'South', 'East', 'West'].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            style={{
              padding: '10px',
              backgroundColor: theme.highlight,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Add Team
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
        {teams.map((team) => (
          <div key={team.id} style={{ padding: '15px', backgroundColor: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: team.color,
                  borderRadius: '50%',
                  border: `2px solid ${theme.cardBorder}`,
                }}
              />
              <h4 style={{ margin: 0, color: theme.text }}>{team.name}</h4>
            </div>
            <p style={{ margin: '5px 0', color: theme.textMuted, fontSize: '14px' }}>Division: {team.division}</p>
            <button
              onClick={() => deleteTeam(team.id)}
              style={{
                marginTop: '10px',
                padding: '6px 10px',
                backgroundColor: theme.warning,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============= COMPONENT: DIVISION MANAGER =============
function DivisionManager({ divisions, teams, addDivision, updateDivision, deleteDivision, theme }) {
  const [name, setName] = useState('');
  const [selectedTeams, setSelectedTeams] = useState([]);

  const handleAdd = () => {
    if (!name) return alert('Please enter division name');
    addDivision(name, selectedTeams);
    setName('');
    setSelectedTeams([]);
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '4px' }}>
        <h3 style={{ marginTop: 0, color: theme.text }}>Add Division</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          <input
            type="text"
            placeholder="Division Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: '10px',
              backgroundColor: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.inputBorder}`,
              borderRadius: '4px',
            }}
          />
          <div>
            <label style={{ display: 'block', marginBottom: '10px', color: theme.text }}>Select Teams:</label>
            {teams.map((team) => (
              <label key={team.id} style={{ display: 'block', marginBottom: '5px', color: theme.text }}>
                <input
                  type="checkbox"
                  checked={selectedTeams.includes(team.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTeams([...selectedTeams, team.id]);
                    } else {
                      setSelectedTeams(selectedTeams.filter((t) => t !== team.id));
                    }
                  }}
                  style={{ marginRight: '8px' }}
                />
                {team.name}
              </label>
            ))}
          </div>
          <button
            onClick={handleAdd}
            style={{
              padding: '10px',
              backgroundColor: theme.highlight,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Add Division
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
        {divisions.map((div) => (
          <div key={div.id} style={{ padding: '15px', backgroundColor: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: theme.text }}>{div.name}</h4>
            <div style={{ marginBottom: '10px' }}>
              {div.teams.map((teamId) => {
                const team = teams.find((t) => t.id === teamId);
                return (
                  <p key={teamId} style={{ margin: '4px 0', color: theme.textMuted, fontSize: '14px' }}>
                    • {team?.name || teamId}
                  </p>
                );
              })}
            </div>
            <button
              onClick={() => deleteDivision(div.id)}
              style={{
                padding: '6px 10px',
                backgroundColor: theme.warning,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============= COMPONENT: RIVALRY MANAGER =============
function RivalryManager({ rivalries, teams, addRivalry, deleteRivalry, theme }) {
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [intensity, setIntensity] = useState('high');

  const handleAdd = () => {
    if (!team1 || !team2) return alert('Please select both teams');
    addRivalry(team1, team2, intensity);
    setTeam1('');
    setTeam2('');
    setIntensity('high');
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '4px' }}>
        <h3 style={{ marginTop: 0, color: theme.text }}>Add Rivalry</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          <select
            value={team1}
            onChange={(e) => setTeam1(e.target.value)}
            style={{
              padding: '10px',
              backgroundColor: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.inputBorder}`,
              borderRadius: '4px',
            }}
          >
            <option value="">Select Team 1</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={team2}
            onChange={(e) => setTeam2(e.target.value)}
            style={{
              padding: '10px',
              backgroundColor: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.inputBorder}`,
              borderRadius: '4px',
            }}
          >
            <option value="">Select Team 2</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={intensity}
            onChange={(e) => setIntensity(e.target.value)}
            style={{
              padding: '10px',
              backgroundColor: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.inputBorder}`,
              borderRadius: '4px',
            }}
          >
            <option value="low">Low Intensity</option>
            <option value="medium">Medium Intensity</option>
            <option value="high">High Intensity</option>
          </select>
          <button
            onClick={handleAdd}
            style={{
              padding: '10px',
              backgroundColor: theme.highlight,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Add Rivalry
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
        {rivalries.map((rivalry) => (
          <div key={rivalry.id} style={{ padding: '15px', backgroundColor: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: theme.text }}>
              {teams.find((t) => t.id === rivalry.team1)?.name || rivalry.team1} vs{' '}
              {teams.find((t) => t.id === rivalry.team2)?.name || rivalry.team2}
            </h4>
            <p style={{ margin: '5px 0', color: theme.textMuted, fontSize: '14px' }}>Intensity: {rivalry.intensity}</p>
            <button
              onClick={() => deleteRivalry(rivalry.id)}
              style={{
                marginTop: '10px',
                padding: '6px 10px',
                backgroundColor: theme.warning,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============= COMPONENT: CONFIGURE PANEL =============
function ConfigurePanel({
  gamesPerTeamPerDiv,
  setGamesPerTeamPerDiv,
  gamesPerTeamOtherDiv,
  setGamesPerTeamOtherDiv,
  allowDoubleHeaders,
  setAllowDoubleHeaders,
  scheduleStartDate,
  setScheduleStartDate,
  scheduleEndDate,
  setScheduleEndDate,
  theme,
}) {
  return (
    <div style={{ padding: '20px', backgroundColor: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '4px' }}>
      <div style={{ display: 'grid', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', color: theme.text, marginBottom: '8px', fontWeight: '600' }}>Games Per Team (Same Division):</label>
          <input
            type="number"
            min="1"
            max="4"
            value={gamesPerTeamPerDiv}
            onChange={(e) => setGamesPerTeamPerDiv(parseInt(e.target.value))}
            style={{
              padding: '10px',
              width: '100%',
              backgroundColor: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.inputBorder}`,
              borderRadius: '4px',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: theme.text, marginBottom: '8px', fontWeight: '600' }}>Games Per Team (Other Division):</label>
          <input
            type="number"
            min="0"
            max="3"
            value={gamesPerTeamOtherDiv}
            onChange={(e) => setGamesPerTeamOtherDiv(parseInt(e.target.value))}
            style={{
              padding: '10px',
              width: '100%',
              backgroundColor: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.inputBorder}`,
              borderRadius: '4px',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', color: theme.text, gap: '10px' }}>
            <input
              type="checkbox"
              checked={allowDoubleHeaders}
              onChange={(e) => setAllowDoubleHeaders(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Allow Double-Headers (2 games same venue/day)
          </label>
        </div>

        <div>
          <label style={{ display: 'block', color: theme.text, marginBottom: '8px', fontWeight: '600' }}>Schedule Start Date:</label>
          <input
            type="date"
            value={scheduleStartDate}
            onChange={(e) => setScheduleStartDate(e.target.value)}
            style={{
              padding: '10px',
              width: '100%',
              backgroundColor: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.inputBorder}`,
              borderRadius: '4px',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: theme.text, marginBottom: '8px', fontWeight: '600' }}>Schedule End Date:</label>
          <input
            type="date"
            value={scheduleEndDate}
            onChange={(e) => setScheduleEndDate(e.target.value)}
            style={{
              padding: '10px',
              width: '100%',
              backgroundColor: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.inputBorder}`,
              borderRadius: '4px',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ============= COMPONENT: SCHEDULE VIEW =============
function ScheduleView({
  schedule,
  teams,
  venues,
  gameScores,
  gameNotes,
  gameRefAssignments,
  referees,
  updateGameScore,
  addGameNote,
  assignRefToGame,
  markGameComplete,
  swapGames,
  teamFilter,
  setTeamFilter,
  theme,
}) {
  const [expandedGame, setExpandedGame] = useState(null);

  const getTeamName = (teamId) => teams.find((t) => t.id === teamId)?.name || teamId;
  const getTeamColor = (teamId) => teams.find((t) => t.id === teamId)?.color || '#888';
  const getVenueName = (venueId) => venues.find((v) => v.id === venueId)?.name || venueId;

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <select
          value={teamFilter || ''}
          onChange={(e) => setTeamFilter(e.target.value || null)}
          style={{
            padding: '10px',
            backgroundColor: theme.inputBg,
            color: theme.text,
            border: `1px solid ${theme.inputBorder}`,
            borderRadius: '4px',
          }}
        >
          <option value="">All Teams</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {schedule.length === 0 ? (
        <p style={{ color: theme.textMuted }}>No games scheduled yet. Configure and generate schedule.</p>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {schedule.map((game) => (
            <div
              key={game.id}
              style={{
                padding: '15px',
                backgroundColor: game.status === 'completed' ? theme.rowBg : theme.card,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onClick={() => setExpandedGame(expandedGame === game.id ? null : game.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  {game.byeWeek ? (
                    <p style={{ margin: 0, color: theme.text, fontWeight: '600' }}>
                      {getTeamName(game.homeTeam)} - BYE WEEK
                    </p>
                  ) : (
                    <div>
                      <p style={{ margin: '0 0 5px 0', color: theme.text, fontWeight: '600' }}>
                        <span style={{ color: getTeamColor(game.homeTeam) }}>●</span> {getTeamName(game.homeTeam)} vs{' '}
                        <span style={{ color: getTeamColor(game.awayTeam) }}>●</span> {getTeamName(game.awayTeam)}
                      </p>
                      <p style={{ margin: '5px 0', color: theme.textMuted, fontSize: '14px' }}>
                        {game.date} {game.time} @ {getVenueName(game.venue)}
                      </p>
                      {gameScores[game.id] && (
                        <p style={{ margin: '5px 0', color: theme.text, fontWeight: '600', fontSize: '14px' }}>
                          {gameScores[game.id].homeScore} - {gameScores[game.id].awayScore}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    padding: '6px 12px',
                    backgroundColor: game.status === 'completed' ? theme.highlight : theme.warning,
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  {game.status.toUpperCase()}
                </div>
              </div>

              {expandedGame === game.id && !game.byeWeek && (
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: `1px solid ${theme.cardBorder}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', color: theme.text, marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>Home Score:</label>
                      <input
                        type="number"
                        value={gameScores[game.id]?.homeScore ?? ''}
                        onChange={(e) => updateGameScore(game.id, parseInt(e.target.value), gameScores[game.id]?.awayScore ?? 0)}
                        style={{
                          padding: '8px',
                          width: '100%',
                          backgroundColor: theme.inputBg,
                          color: theme.text,
                          border: `1px solid ${theme.inputBorder}`,
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: theme.text, marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>Away Score:</label>
                      <input
                        type="number"
                        value={gameScores[game.id]?.awayScore ?? ''}
                        onChange={(e) => updateGameScore(game.id, gameScores[game.id]?.homeScore ?? 0, parseInt(e.target.value))}
                        style={{
                          padding: '8px',
                          width: '100%',
                          backgroundColor: theme.inputBg,
                          color: theme.text,
                          border: `1px solid ${theme.inputBorder}`,
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: theme.text, marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>Notes:</label>
                      <input
                        type="text"
                        placeholder="Game notes..."
                        value={gameNotes[game.id] || ''}
                        onChange={(e) => addGameNote(game.id, e.target.value)}
                        style={{
                          padding: '8px',
                          width: '100%',
                          backgroundColor: theme.inputBg,
                          color: theme.text,
                          border: `1px solid ${theme.inputBorder}`,
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => markGameComplete(game.id)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: theme.highlight,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Mark Complete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============= COMPONENT: CALENDAR HEATMAP =============
function CalendarHeatmap({ heatmap, scheduleStartDate, scheduleEndDate, theme }) {
  const start = new Date(scheduleStartDate);
  const end = new Date(scheduleEndDate);
  const weeks = [];
  const daysInMonth = [];

  let current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    daysInMonth.push({ date: dateStr, gameCount: heatmap[dateStr] || 0 });
    current.setDate(current.getDate() + 1);
  }

  const maxGames = Math.max(...daysInMonth.map((d) => d.gameCount), 1);

  const getHeatmapColor = (gameCount) => {
    if (gameCount === 0) return '#e0e0e0';
    const intensity = gameCount / maxGames;
    if (intensity < 0.33) return '#ffeeee';
    if (intensity < 0.67) return '#ffaaaa';
    return '#ff0000';
  };

  return (
    <div style={{ padding: '15px', backgroundColor: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '4px', overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', minWidth: '300px' }}>
        {daysInMonth.map((day) => (
          <div
            key={day.date}
            style={{
              padding: '8px',
              backgroundColor: getHeatmapColor(day.gameCount),
              borderRadius: '4px',
              textAlign: 'center',
              fontSize: '12px',
              color: day.gameCount > 0 ? 'white' : theme.text,
              fontWeight: '500',
            }}
            title={`${day.date}: ${day.gameCount} games`}
          >
            {day.gameCount}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============= COMPONENT: VENUE UTILIZATION VIEW =============
function VenueUtilizationView({ utilization, theme }) {
  return (
    <div>
      {Object.values(utilization).map((venue) => (
        <div key={venue.name} style={{ marginBottom: '15px', padding: '15px', backgroundColor: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h4 style={{ margin: 0, color: theme.text }}>{venue.name}</h4>
            <span style={{ color: theme.textMuted, fontSize: '14px' }}>
              {venue.usedSlots} / {venue.totalSlots} slots
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: theme.rowBg, borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${(venue.usedSlots / venue.totalSlots) * 100}%`,
                backgroundColor: theme.highlight,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============= COMPONENT: STANDINGS VIEW =============
function StandingsView({ standings, theme }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: theme.tabBg, borderBottom: `2px solid ${theme.cardBorder}` }}>
            <th style={{ padding: '12px', textAlign: 'left', color: theme.text, fontWeight: '600' }}>Rank</th>
            <th style={{ padding: '12px', textAlign: 'left', color: theme.text, fontWeight: '600' }}>Team</th>
            <th style={{ padding: '12px', textAlign: 'center', color: theme.text, fontWeight: '600' }}>W</th>
            <th style={{ padding: '12px', textAlign: 'center', color: theme.text, fontWeight: '600' }}>L</th>
            <th style={{ padding: '12px', textAlign: 'center', color: theme.text, fontWeight: '600' }}>PCT</th>
            <th style={{ padding: '12px', textAlign: 'center', color: theme.text, fontWeight: '600' }}>Streak</th>
            <th style={{ padding: '12px', textAlign: 'center', color: theme.text, fontWeight: '600' }}>GB</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, idx) => (
            <tr key={s.teamId} style={{ borderBottom: `1px solid ${theme.cardBorder}`, backgroundColor: idx % 2 === 0 ? theme.card : theme.rowBg' }}>
              <td style={{ padding: '12px', color: theme.text, fontWeight: '600' }}>{idx + 1}</td>
              <td style={{ padding: '12px', color: theme.text }}>{s.team}</td>
              <td style={{ padding: '12px', textAlign: 'center', color: theme.text }}>{s.wins}</td>
              <td style={{ padding: '12px', textAlign: 'center', color: theme.text }}>{s.losses}</td>
              <td style={{ padding: '12px', textAlign: 'center', color: theme.text }}>{s.pct}</td>
              <td style={{ padding: '12px', textAlign: 'center', color: theme.text }}>{s.streak}</td>
              <td style={{ padding: '12px', textAlign: 'center', color: theme.text }}>{s.gamesBack.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============= COMPONENT: STRENGTH OF SCHEDULE VIEW =============
function StrengthOfScheduleView({ sos, theme }) {
  const sorted = Object.values(sos).sort((a, b) => b.avgOpponentWins - a.avgOpponentWins);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
      {sorted.map((item) => (
        <div key={item.team} style={{ padding: '15px', backgroundColor: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: theme.text }}>{item.team}</h4>
          <p style={{ margin: 0, color: theme.textMuted, fontSize: '14px' }}>Avg Opponent Wins: {item.avgOpponentWins}</p>
        </div>
      ))}
    </div>
  );
}

// ============= COMPONENT: TEAM HUB VIEW =============
function TeamHubView({ teams, schedule, gameScores, selectedTeamPortal, setSelectedTeamPortal, getTeamName, getVenueName, theme }) {
  const teamGames = selectedTeamPortal
    ? schedule.filter((g) => g.homeTeam === selectedTeamPortal || g.awayTeam === selectedTeamPortal)
    : [];

  const teamStats = selectedTeamPortal && teams.find((t) => t.id === selectedTeamPortal)
    ? (() => {
        let wins = 0;
        let losses = 0;
        let homeGames = 0;
        let awayGames = 0;

        teamGames.forEach((g) => {
          if (g.status === 'completed' && gameScores[g.id]) {
            if (g.homeTeam === selectedTeamPortal) {
              homeGames++;
              if (gameScores[g.id].homeScore > gameScores[g.id].awayScore) wins++;
              else losses++;
            } else {
              awayGames++;
              if (gameScores[g.id].awayScore > gameScores[g.id].homeScore) wins++;
              else losses++;
            }
          }
        });

        return { wins, losses, homeGames, awayGames };
      })()
    : null;

  return (
    <div>
      <select
        value={selectedTeamPortal || ''}
        onChange={(e) => setSelectedTeamPortal(e.target.value || null)}
        style={{
          padding: '10px',
          marginBottom: '20px',
          backgroundColor: theme.inputBg,
          color: theme.text,
          border: `1px solid ${theme.inputBorder}`,
          borderRadius: '4px',
        }}
      >
        <option value="">Select a Team</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      {selectedTeamPortal && teamStats && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
            <div style={{ padding: '15px', backgroundColor: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '4px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 10px 0', color: theme.textMuted, fontSize: '14px' }}>Wins</p>
              <h2 style={{ margin: 0, color: theme.text }}>{teamStats.wins}</h2>
            </div>
            <div style={{ padding: '15px', backgroundColor: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '4px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 10px 0', color: theme.textMuted, fontSize: '14px' }}>Losses</p>
              <h2 style={{ margin: 0, color: theme.text }}>{teamStats.losses}</h2>
            </div>
            <div style={{ padding: '15px', backgroundColor: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '4px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 10px 0', color: theme.textMuted, fontSize: '14px' }}>Home</p>
              <h2 style={{ margin: 0, color: theme.text }}>{teamStats.homeGames}</h2>
            </div>
            <div style={{ padding: '15px', backgroundColor: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '4px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 10px 0', color: theme.textMuted, fontSize: '14px' }}>Away</p>
              <h2 style={{ margin: 0, color: theme.text }}>{teamStats.awayGames}</h2>
            </div>
          </div>

          <h3 style={{ color: theme.text, marginBottom: '15px' }}>{getTeamName(selectedTeamPortal)} Schedule</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {teamGames.length === 0 ? (
              <p style={{ color: theme.textMuted }}>No games scheduled for this team.</p>
            ) : (
              teamGames.map((game) => (
                <div key={game.id} style={{ padding: '12px', backgroundColor: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: '0 0 5px 0', color: theme.text, fontWeight: '600' }}>
                        {game.homeTeam === selectedTeamPortal ? 'HOME' : 'AWAY'} vs{' '}
                        {game.homeTeam === selectedTeamPortal ? getTeamName(game.awayTeam) : getTeamName(game.homeTeam)}
                      </p>
                      <p style={{ margin: '5px 0', color: theme.textMuted, fontSize: '14px' }}>
                        {game.date} {game.time} @ {getVenueName(game.venue)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: '0 0 5px 0', color: game.status === 'completed' ? theme.text : theme.textMuted, fontWeight: '600' }}>
                        {gameScores[game.id] ? `${gameScores[game.id].homeScore} - ${gameScores[game.id].awayScore}` : '-'}
                      </p>
                      <p style={{ margin: 0, color: theme.textMuted, fontSize: '12px' }}>{game.status}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============= COMPONENT: PLAYOFF BRACKET VIEW =============
function PlayoffBracketView({ bracket, divisions, theme }) {
  return (
    <div>
      {Object.entries(bracket).map(([divId, divTeams]) => {
        const div = divisions.find((d) => d.id === divId);
        return (
          <div key={divId} style={{ marginBottom: '30px' }}>
            <h3 style={{ color: theme.text, marginBottom: '15px' }}>{div?.name} Division</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
              {divTeams.map((team, idx) => (
                <div
                  key={team.teamId}
                  style={{
                    padding: '15px',
                    backgroundColor: idx === 0 ? theme.highlight : theme.card,
                    border: `1px solid ${theme.cardBorder}`,
                    borderRadius: '4px',
                  }}
                >
                  <p style={{ margin: '0 0 5px 0', color: idx === 0 ? 'white' : theme.textMuted, fontSize: '12px' }}>
                    Seed {idx + 1}
                  </p>
                  <h4 style={{ margin: '5px 0 10px 0', color: idx === 0 ? 'white' : theme.text }}>{team.team}</h4>
                  <p style={{ margin: '5px 0', color: idx === 0 ? 'white' : theme.text, fontSize: '14px' }}>
                    {team.wins}W - {team.losses}L
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============= COMPONENT: REFEREE MANAGER =============
function RefereeManager({ referees, addReferee, deleteReferee, theme }) {
  const [name, setName] = useState('');
  const [experience, setExperience] = useState('medium');

  const handleAdd = () => {
    if (!name) return alert('Please enter referee name');
    addReferee(name, experience);
    setName('');
    setExperience('medium');
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '4px' }}>
        <h3 style={{ marginTop: 0, color: theme.text }}>Add Referee</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          <input
            type="text"
            placeholder="Referee Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: '10px',
              backgroundColor: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.inputBorder}`,
              borderRadius: '4px',
            }}
          />
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            style={{
              padding: '10px',
              backgroundColor: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.inputBorder}`,
              borderRadius: '4px',
            }}
          >
            <option value="low">Low Experience</option>
            <option value="medium">Medium Experience</option>
            <option value="high">High Experience</option>
          </select>
          <button
            onClick={handleAdd}
            style={{
              padding: '10px',
              backgroundColor: theme.highlight,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Add Referee
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
        {referees.map((ref) => (
          <div key={ref.id} style={{ padding: '15px', backgroundColor: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: theme.text }}>{ref.name}</h4>
            <p style={{ margin: '5px 0', color: theme.textMuted, fontSize: '14px' }}>Experience: {ref.experience}</p>
            <button
              onClick={() => deleteReferee(ref.id)}
              style={{
                marginTop: '10px',
                padding: '6px 10px',
                backgroundColor: theme.warning,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============= COMPONENT: REFEREE WORKLOAD VIEW =============
function RefereeWorkloadView({ gameRefAssignments, referees, theme }) {
  const workload = {};
  referees.forEach((ref) => {
    workload[ref.id] = { name: ref.name, games: 0 };
  });

  Object.values(gameRefAssignments).forEach((refIds) => {
    if (Array.isArray(refIds)) {
      refIds.forEach((refId) => {
        if (workload[refId]) {
          workload[refId].games++;
        }
      });
    }
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
      {Object.values(workload).map((ref) => (
        <div key={ref.name} style={{ padding: '15px', backgroundColor: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: theme.text }}>{ref.name}</h4>
          <p style={{ margin: 0, color: theme.text, fontSize: '18px', fontWeight: '600' }}>{ref.games} games assigned</p>
        </div>
      ))}
    </div>
  );
}
