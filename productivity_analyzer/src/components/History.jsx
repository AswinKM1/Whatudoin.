import React, { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './Dashboard';

export default function History() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const jumpToToday = () => {
        const today = new Date();
        setSelectedDate(today);
        setCurrentMonth(today);
    };

    // Calendar Grid Generation
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    const isTodaySelected = isSameDay(selectedDate, new Date());

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">History</h1>
                    <p className="text-muted-foreground">Review your past performance.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar Side */}
                <div className="lg:col-span-1">
                    <div className="bg-black/20 backdrop-blur-xl border border-white/5 p-6 rounded-3xl">
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white">
                                {format(currentMonth, 'MMMM yyyy')}
                            </h2>
                            <div className="flex gap-2">
                                <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-2 mb-4">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                                <div key={day} className="text-center text-xs text-muted-foreground font-medium py-2">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {calendarDays.map((day, dayIdx) => {
                                const isSelected = isSameDay(day, selectedDate);
                                const isCurrentMonth = isSameMonth(day, currentMonth);
                                const isDayToday = isToday(day);

                                return (
                                    <button
                                        key={day.toString()}
                                        onClick={() => setSelectedDate(day)}
                                        className={`
                                            relative aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-200
                                            ${!isCurrentMonth ? 'text-gray-700' : 'text-gray-300 hover:bg-white/5 hover:text-white'}
                                            ${isSelected ? 'bg-purple-600 !text-white shadow-lg shadow-purple-500/30' : ''}
                                            ${isDayToday && !isSelected ? 'text-purple-400 border border-purple-500/30' : ''}
                                        `}
                                    >
                                        {format(day, 'd')}
                                        {isDayToday && <div className="absolute bottom-1.5 w-1 h-1 bg-purple-400 rounded-full" />}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={jumpToToday}
                            className="w-full mt-6 py-2 px-4 rounded-xl border border-white/10 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Jump to Today
                        </button>
                    </div>
                </div>

                {/* Analysis Side */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedDate.toString()}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Dashboard date={selectedDate} />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
