import React, { useState } from 'react';
import { useFirestoreData } from '../hooks/useFirestoreData';
import { analyzeProductivity } from '../utils/analyze';
import { Activity, TrendingUp, AlertCircle, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';

import { Download } from 'lucide-react';

export default function Dashboard({ date = new Date(), showExport = false }) {
    const { data, loading } = useFirestoreData(date);
    const analysis = React.useMemo(() => analyzeProductivity(data), [data]);

    const handleExport = () => {
        const dateStr = date.toDateString();
        // Filter and format the raw entries if available in 'data', or use 'processedEntries' from analysis
        // analysis.processedEntries is usually what we want.

        let textContent = `Productivity Analysis for ${dateStr}\n${'='.repeat(40)}\n\n`;

        if (analysis.processedEntries && analysis.processedEntries.length > 0) {
            textContent += `Entries:\n${'-'.repeat(20)}\n`;
            textContent += analysis.processedEntries.map(entry => {
                const time = entry.date ? entry.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown Time';
                return `[${time}] ${entry.text}`;
            }).join('\n\n');
        } else {
            textContent += "No entries recorded for this day.";
        }

        const blob = new Blob([textContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `productivity_${date.toISOString().split('T')[0]}.txt`;
        link.click();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const isToday = new Date().toDateString() === date.toDateString();

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {isToday ? "Daily Insight" : date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h1>
                    <div className="flex items-center gap-4">
                        <p className="text-muted-foreground">
                            {isToday ? "Here is how you performed today." : "Historical performance overview."}
                        </p>
                        {showExport && (
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-purple-400 border border-purple-500/20 transition-colors"
                            >
                                <Download className="w-3 h-3" /> Export
                            </button>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                        {analysis.overallScore}<span className="text-lg text-muted-foreground font-normal">/100</span>
                    </p>
                    <p className="text-sm text-muted-foreground">Productivity Score</p>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Productive"
                    value={analysis.stats.productive}
                    icon={<TrendingUp className="text-emerald-400" />}
                    color="bg-emerald-500/10 border-emerald-500/20"
                />
                <StatCard
                    title="Unproductive"
                    value={analysis.stats.unproductive}
                    icon={<AlertCircle className="text-rose-400" />}
                    color="bg-rose-500/10 border-rose-500/20"
                />
                <StatCard
                    title="Total Entries"
                    value={analysis.stats.total}
                    icon={<Activity className="text-blue-400" />}
                    color="bg-blue-500/10 border-blue-500/20"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Timeline Section */}
                <section className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-400" /> Timeline
                    </h2>
                    <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-white/5 p-6 space-y-6 min-h-[200px]">
                        {analysis.processedEntries.length === 0 ? (
                            <div className="text-center text-muted-foreground py-10 flex flex-col items-center">
                                <CalendarIcon className="w-10 h-10 mb-3 opacity-20" />
                                <p>No activities recorded.</p>
                            </div>
                        ) : (
                            analysis.processedEntries.map((item, index) => (
                                <TimelineItem key={item.id} item={item} index={index} />
                            ))
                        )}
                    </div>
                </section>

                {/* Suggestions Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-400" /> Suggestions
                    </h2>
                    <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-white/5 p-6">
                        <ul className="space-y-4">
                            {analysis.suggestions.length > 0 ? (
                                analysis.suggestions.map((suggestion, idx) => (
                                    <li key={idx} className="flex gap-3 text-sm text-gray-300">
                                        <span className="text-yellow-400">•</span>
                                        {suggestion}
                                    </li>
                                ))
                            ) : (
                                <p className="text-sm text-emerald-400">Great job! No immediate improvements needed.</p>
                            )}
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl border backdrop-blur-md ${color} flex items-center justify-between`}
        >
            <div>
                <p className="text-sm text-muted-foreground mb-1">{title}</p>
                <p className="text-3xl font-bold text-white">{value}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
                {icon}
            </div>
        </motion.div>
    );
}

function TimelineItem({ item, index }) {
    const isProductive = item.score > 5;
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4 relative"
        >
            {/* Connector Line */}
            <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full mt-1.5 ${isProductive ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`} />
                <div className="w-0.5 h-full bg-white/10 -mb-6" />
            </div>

            <div className="flex-1 pb-6">
                <div className="flex justify-between items-start">
                    <p className={`text-md font-medium ${isProductive ? 'text-white' : 'text-gray-400'}`}>{item.text}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <div className="mt-2 flex gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${isProductive
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}>
                        {item.type.toUpperCase()}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-gray-400">
                        SCORE: {item.score}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
