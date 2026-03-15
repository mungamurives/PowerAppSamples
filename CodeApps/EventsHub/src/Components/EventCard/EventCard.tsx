import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { crb5a_codeapps_eventdetailses } from '../../generated/models/Crb5a_codeapps_eventdetailsesModel';
import type { CodeApps_EventDocuments } from '../../generated/models/CodeApps_EventDocumentsModel';
import { CodeApps_EventDocumentsService } from '../../generated/services/CodeApps_EventDocumentsService';
import {
    Calendar20Regular,
    ArrowDownload20Regular,
    Globe20Regular,
    People20Regular
} from '@fluentui/react-icons';
import 'office-ui-fabric-core/dist/css/fabric.min.css';
import '../../App.css';
import './EventCard.css';

interface EventCardProps {
    event: crb5a_codeapps_eventdetailses;
}

export default function EventCard({ event }: EventCardProps) {
    const navigate = useNavigate();
    const [eventDocument, setEventDocument] = useState<CodeApps_EventDocuments | null>(null);
    const [isLoadingDocument, setIsLoadingDocument] = useState<boolean>(true);

    // Load document on component mount
    useEffect(() => {
        const loadEventDocument = async () => {
            if (!event.crb5a_codeapps_eventdetailsid) {
                setIsLoadingDocument(false);
                return;
            }

            try {
                const result = await CodeApps_EventDocumentsService.getAll({
                    filter: `RefClientGUID eq '${event.crb5a_codeapps_eventdetailsid}'`
                });

                if (result.success && result.data && result.data.length > 0) {
                    setEventDocument(result.data[0]);
                }
            } catch (error) {
                console.error('Error loading event document:', error);
            } finally {
                setIsLoadingDocument(false);
            }
        };

        loadEventDocument();
    }, [event.crb5a_codeapps_eventdetailsid]);

    // Download document function
    const handleDownloadDocument = async () => {
        if (!eventDocument || !eventDocument["{Link}"]) {
            return;
        }

        try {
            const documentUrl = eventDocument["{Link}"] as string;

            // Extract the SharePoint domain and site from the URL
            const urlMatch = documentUrl.match(/(https:\/\/[^\/]+\/sites\/[^\/]+)/);
            if (urlMatch) {
                const siteUrl = urlMatch[1];
                // Option 1: Use SharePoint's download.aspx format for forcing download
                const downloadUrl = `${siteUrl}/_layouts/download.aspx?SourceUrl=${encodeURIComponent(documentUrl)}`;
                
                // Create link and trigger download
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', '');
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                
                // Clean up
                setTimeout(() => {
                    document.body.removeChild(link);
                }, 100);
            } else {
                // Option 2: Use download parameter directly
                const downloadUrl = documentUrl.includes('?')
                    ? `${documentUrl}&download=1`
                    : `${documentUrl}?download=1`;
                
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', '');
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                
                // Clean up
                setTimeout(() => {
                    document.body.removeChild(link);
                }, 100);
            }

        } catch (error) {
            console.error('Error downloading document:', error);
        }
    };

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

    // Truncate text utility
    const truncateText = (text: string, maxLength: number = 150) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    };

    // Get event type display info
    const getEventTypeInfo = (eventType: any) => {
        if (!eventType) return { text: '', backgroundColor: '#757575', color: 'white' };

        // Handle if eventType is an object (SharePoint choice field)
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

        // Map SharePoint choice field IDs to display values
        const eventTypeMapping: { [key: string]: { text: string, backgroundColor: string, color: string } } = {
            '210750000': { text: 'Virtual', backgroundColor: 'rgba(25, 124, 128, 0.15)', color: '#197c80' },
            '210750001': { text: 'In Person', backgroundColor: 'rgba(254, 127, 45, 0.15)', color: '#FE7F2D' }
        };

        // Check if it's a mapped ID
        if (eventTypeMapping[typeValue]) {
            return eventTypeMapping[typeValue];
        }

        // Fallback to text-based matching
        switch (typeValue.toLowerCase()) {
            case 'virtual':
                return { text: 'Virtual', backgroundColor: 'rgba(25, 124, 128, 0.15)', color: '#197c80' };
            case 'in person':
                return { text: 'In Person', backgroundColor: 'rgba(254, 127, 45, 0.15)', color: '#FE7F2D' };
            default:
                return { text: typeValue, backgroundColor: 'rgba(25, 124, 128, 0.15)', color: '#197c80' };
        }
    };

    return (
        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3 ms-xl2">
            <div className="eventCard standardMargin">
                {/* Event Type Tag */}
                {event.crb5a_eventtype && (
                    <div className={`event-type-tag ${getEventTypeInfo(event.crb5a_eventtype).text === 'Virtual' ? 'event-type-virtual' : 'event-type-in-person'}`}>
                        {getEventTypeInfo(event.crb5a_eventtype).text}
                    </div>
                )}
                <div className="cardTitle">{event.crb5a_title}</div>
                <div className="cardDescription standardMargin">
                    {truncateText(event.crb5a_shortdescription)}
                </div>
                {/* Location Details */}
                {event.crb5a_locationdetails && (
                    <div className="standardMargin">
                        <div className='icon-container'>
                            {(() => {
                                const eventTypeInfo = getEventTypeInfo(event.crb5a_eventtype);
                                const isVirtual = eventTypeInfo.text === 'Virtual';

                                if (isVirtual) {
                                    return (
                                        <a
                                            href={event.crb5a_locationdetails}
                                            target="_blank"
                                            className="location-virtual-link"
                                        >
                                            <Globe20Regular className="external-link-icon" />
                                            Virtual Link
                                        </a>
                                    );
                                } else {
                                    return (
                                        <div className="location-in-person">
                                            <People20Regular className="location-icon" />
                                            {event.crb5a_locationdetails}
                                        </div>
                                    );
                                }
                            })()}
                        </div>
                    </div>
                )}
                {/* Event Dates */}
                <div className="standardMargin">
                    <div className="icon-container">
                        <Calendar20Regular className="calendar-icon" />
                        <span style={{ marginLeft: "5px" }}>
                            {formatDate(event.crb5a_startdate)}
                            {event.crb5a_enddate && ` - ${formatDate(event.crb5a_enddate)}`}
                        </span>
                    </div>
                </div>
                {/* More Details Button and Download Document */}
                <div className="button-container standardMargin">
                    <button
                        className="more-details-button"
                        onClick={() => {
                            navigate(`/event/${event.crb5a_codeapps_eventdetailsid}`);
                        }}
                    >
                        More Details
                    </button>
                    {/* Download Document Icon */}
                    {!isLoadingDocument && eventDocument && (
                        <button
                            className="download-button"
                            onClick={handleDownloadDocument}
                            title={`Download ${eventDocument["{FilenameWithExtension}"] || 'document'}`}
                        >
                            <ArrowDownload20Regular className="download-icon" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
} 