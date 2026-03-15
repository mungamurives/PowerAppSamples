import { useState, useEffect } from 'react';
import type { crb5a_codeapps_eventdetailses } from '../../generated/models/Crb5a_codeapps_eventdetailsesModel';
import type { IGetAllOptions } from '../../generated/models/CommonModels';
import { crb5a_codeapps_eventdetailsesService } from '../../generated/services/Crb5a_codeapps_eventdetailsesService';
import { crb5a_codeapps_eventregistrationsService } from '../../generated/services/crb5a_codeapps_eventregistrationsService';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import EventCard from '../EventCard/EventCard';
import '../../App.css';
import './Events.css';

interface EventsProps {
    eventType: 'all' | 'my';
    userEmail: string;
    onEventChange?: (event: crb5a_codeapps_eventdetailses | null) => void;
}

export default function Events({ eventType, userEmail, onEventChange }: EventsProps) {
    const [events, setEvents] = useState<crb5a_codeapps_eventdetailses[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        // Clear current event when navigating to events list
        if (onEventChange) {
            onEventChange(null);
        }
    }, [onEventChange]);

    // Separate useEffect for "all" events - loads immediately
    useEffect(() => {
        if (eventType !== 'all') return;

        const fetchAllEvents = async () => {
            try {
                setLoading(true);
                setError('');
                // Fetch all events
                const options: IGetAllOptions = {
                    select: ['crb5a_title', 'crb5a_shortdescription', 'crb5a_maindescription', 'crb5a_eventtype', 'crb5a_startdate', 'crb5a_enddate', 'crb5a_locationdetails', 'crb5a_codeapps_eventdetailsid'],
                };
                const result = await crb5a_codeapps_eventdetailsesService.getAll(options);
                if (result.success && result.data) {
                    setEvents(result.data);
                } else {
                    setError('Failed to fetch events');
                }
            } catch (err) {
                console.error('Error fetching all events:', err);
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchAllEvents();
    }, [eventType]);

    // Separate useEffect for "my" events - waits for userEmail
    useEffect(() => {
        if (eventType !== 'my') return;

        const fetchMyEvents = async () => {
            try {
                setLoading(true);
                setError('');
                // Fetch user's registered events
                if (!userEmail) {
                    setError('User email not available');
                    setLoading(false);
                    return;
                }

                // First get the user's registrations
                const registrationOptions: IGetAllOptions = {
                    filter: `crb5a_useremailid eq '${userEmail}'`,
                    select: ['_crb5a_refclientid_value', 'crb5a_useremailid']
                };

                const registrationResult = await crb5a_codeapps_eventregistrationsService.getAll(registrationOptions);
                debugger;
                if (registrationResult.success && registrationResult.data && registrationResult.data.length > 0) {
                    // Extract event IDs from registrations using the correct lookup field
                    const eventIds = registrationResult.data
                        .map(reg => (reg as any)['_crb5a_refclientid_value'] as string)
                        .filter(id => id); // Remove any null/undefined IDs
                  

                    if (eventIds.length > 0) {
                        // Create filter for multiple event IDs
                        const idFilters = eventIds.map(id => `crb5a_codeapps_eventdetailsid eq '${id}'`).join(' or ');
                        const eventOptions: IGetAllOptions = {
                            filter: idFilters,
                            select: ['crb5a_title', 'crb5a_shortdescription', 'crb5a_maindescription', 'crb5a_eventtype', 'crb5a_startdate', 'crb5a_enddate', 'crb5a_locationdetails', 'crb5a_codeapps_eventdetailsid'],
                        };

                        const eventsResult = await crb5a_codeapps_eventdetailsesService.getAll(eventOptions);

                        if (eventsResult.success && eventsResult.data) {
                            setEvents(eventsResult.data);
                        } else {
                            setError('Failed to fetch registered events');
                        }
                    } else {
                        setEvents([]); // No registered events
                    }
                } else {
                    console.error('Registration fetch failed:', registrationResult.error);
                    if (registrationResult.error?.message?.includes('Could not find a property')) {
                        setError('Configuration error: Event registration fields not properly configured');
                    } else {
                        setEvents([]); // No registrations found or error occurred
                    }
                }
            } catch (err) {
                console.error('Error fetching my events:', err);
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchMyEvents();
    }, [eventType, userEmail]);

    if (loading) {
        return (
            <div className="events-loading-container">
                <Spinner size={SpinnerSize.large} label="Loading events..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="events-error-container">
                <p className="events-error-message">Error: {error}</p>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="events-empty-container">
                <p className="events-empty-message">
                    {eventType === 'my' ? 'No registered events found.' : 'No events available.'}
                </p>
            </div>
        );
    }

    return (
        <div className="events-container">
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    {events.map(event => (
                        <EventCard key={event.crb5a_codeapps_eventdetailsid} event={event} />
                    ))}
                </div>
            </div>
        </div>
    );
} 