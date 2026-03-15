import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner, SpinnerSize } from '@fluentui/react';
import { Calendar20Regular, Globe20Regular, People20Regular } from '@fluentui/react-icons';
import type { crb5a_codeapps_eventdetailses } from '../../generated/models/Crb5a_codeapps_eventdetailsesModel';
import type { IGetAllOptions } from '../../generated/models/CommonModels';
import { crb5a_codeapps_eventdetailsesService } from '../../generated/services/Crb5a_codeapps_eventdetailsesService';
import '../../App.css';
import './Event.css';

interface EventProps {
    onEventLoad?: (event: crb5a_codeapps_eventdetailses | null) => void;
}

export default function Event({ onEventLoad }: EventProps) {
    // Get event ID from route params
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<crb5a_codeapps_eventdetailses | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchEvent = async () => {
            if (!eventId) {
                setError('Event ID not provided');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const options: IGetAllOptions = {
                    filter: `crb5a_codeapps_eventdetailsid eq '${eventId}'`,
                    select: ['crb5a_title', 'crb5a_shortdescription', 'crb5a_maindescription', 'crb5a_eventtype', 'crb5a_startdate', 'crb5a_enddate', 'crb5a_locationdetails', 'crb5a_codeapps_eventdetailsid'],
                };

                const result = await crb5a_codeapps_eventdetailsesService.getAll(options);

                if (result.success && result.data && result.data.length > 0) {
                    const eventData = result.data[0];
                    setEvent(eventData);
                    // Update banner with event details
                    if (onEventLoad) {
                        onEventLoad(eventData);
                    }
                } else {
                    setError('Event not found');
                }
            } catch (err) {
                console.error('Error fetching event:', err);
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [eventId]);

    // Date formatting utility
    const formatDate = (dateString: any) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const year = date.getFullYear();

        const getOrdinal = (n: number) => {
            const s = ['th', 'st', 'nd', 'rd'];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };

        return `${getOrdinal(day)} ${month} ${year}`;
    };

    // Get event type display info
    const getEventTypeInfo = (eventType: any) => {
        if (!eventType) return { text: '', backgroundColor: '#757575', color: 'white' };

        let typeValue = '';
        if (typeof eventType === 'string') {
            typeValue = eventType;
        } else if (eventType.Value) {
            typeValue = eventType.Value;
        } else if (eventType.Label) {
            typeValue = eventType.Label;
        } else {
            typeValue = String(eventType);
        }

        const eventTypeMapping: { [key: string]: { text: string, backgroundColor: string, color: string } } = {
            '210750000': { text: 'Virtual', backgroundColor: 'rgba(25, 124, 128, 0.15)', color: '#197c80' },
            '210750001': { text: 'In Person', backgroundColor: 'rgba(254, 127, 45, 0.15)', color: '#FE7F2D' }
        };

        if (eventTypeMapping[typeValue]) {
            return eventTypeMapping[typeValue];
        }

        switch (typeValue.toLowerCase()) {
            case 'virtual':
                return { text: 'Virtual', backgroundColor: 'rgba(25, 124, 128, 0.15)', color: '#197c80' };
            case 'in person':
                return { text: 'In Person', backgroundColor: 'rgba(254, 127, 45, 0.15)', color: '#FE7F2D' };
            default:
                return { text: typeValue, backgroundColor: 'rgba(25, 124, 128, 0.15)', color: '#197c80' };
        }
    };

    if (loading) {
        return (
            <div className="event-loading-container">
                <Spinner size={SpinnerSize.large} label="Loading event details..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="event-error-container">
                <p className="event-error-message">Error: {error}</p>
                <button
                    onClick={() => navigate('/all-events')}
                    className="event-error-button"
                >
                    Back to Events
                </button>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="event-not-found-container">
                <p>Event not found</p>
            </div>
        );
    }

    return (
        <div className="event-main-container">
            <div className="event-content">
                {/* Event Header */}
                <div className="event-header">
                    {/* Event Type Tag */}
                    {event.crb5a_eventtype && (
                        <div
                            className="event-type-tag"
                            style={{
                                ...getEventTypeInfo(event.crb5a_eventtype)
                            }}
                        >
                            {getEventTypeInfo(event.crb5a_eventtype).text}
                        </div>
                    )}
                    <div className="event-title">
                        {event.crb5a_title}
                    </div>
                    <p className="event-short-description">
                        {event.crb5a_shortdescription}
                    </p>
                </div>
                {/* Event Details Grid */}
                <div className="event-details-container">
                    {/* Event Info */}
                    <div className="event-info-section">
                        {/* Date and Time */}
                        <div className="event-date-section">
                            <div className="event-section-title">
                                <Calendar20Regular className="event-section-icon" />
                                Date & Time
                            </div>
                            <p className="event-section-content">
                                {formatDate(event.crb5a_startdate)}
                                {event.crb5a_enddate && ` - ${formatDate(event.crb5a_enddate)}`}
                            </p>
                        </div>
                        {/* Location */}
                        {event.crb5a_locationdetails && (
                            <div className="event-location-section">
                                <div className="event-section-title">
                                    {getEventTypeInfo(event.crb5a_eventtype).text === 'Virtual' ?
                                        <Globe20Regular className="event-section-icon" /> :
                                        <People20Regular className="event-section-icon" />
                                    }
                                    {getEventTypeInfo(event.crb5a_eventtype).text === 'Virtual' ? 'Join Link' : 'Location'}
                                </div>
                                {getEventTypeInfo(event.crb5a_eventtype).text === 'Virtual' ? (
                                    <a
                                        href={event.crb5a_locationdetails}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="event-virtual-link"
                                    >
                                        Join Virtual Event
                                    </a>
                                ) : (
                                    <p className="event-section-content">
                                        {event.crb5a_locationdetails}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {/* Event Description */}
                {event.crb5a_maindescription && (
                    <div className="event-description-section">
                        <div className="event-description-title">
                            About This Event
                        </div>
                        <div
                            className="event-description-content"
                            dangerouslySetInnerHTML={{ __html: event.crb5a_maindescription.replace(/\n/g, '<br>') }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
} 