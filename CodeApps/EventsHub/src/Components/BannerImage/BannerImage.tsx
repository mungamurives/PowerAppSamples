import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { ImageLibrary } from '../../generated/models/ImageLibraryModel';
import type { crb5a_codeapps_eventdetailses } from '../../generated/models/Crb5a_codeapps_eventdetailsesModel';
import type { crb5a_codeapps_eventregistrations } from '../../generated/models/crb5a_codeapps_eventregistrationsModel';
import { crb5a_codeapps_eventregistrationsService } from '../../generated/services/crb5a_codeapps_eventregistrationsService';
import ConfirmationPop from '../ConfirmationPop/ConfirmationPop';
import './BannerImage.css';
import bannerImage from '/BannerImage.jpg';

interface BannerImageProps {
    bannerImage?: ImageLibrary | null;
    event?: crb5a_codeapps_eventdetailses | null;
    userEmail?: string;
}

export default function BannerImage({ event, userEmail = '' }: BannerImageProps) {
    const navigate = useNavigate();
    const [isAlreadyRegistered, setIsAlreadyRegistered] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // Modal state
    const [showModal, setShowModal] = useState<boolean>(false);
    const [modalConfig, setModalConfig] = useState({
        title: '',
        body: '',
        type: 'info' as 'success' | 'error' | 'warning' | 'info'
    });

    useEffect(() => {

        if (event && userEmail) {

            checkRegistration();

        }

    }, [event, userEmail]);

    const checkRegistration = async () => {
        try {

            const registrationsResult = await crb5a_codeapps_eventregistrationsService.getAll({
                filter: `crb5a_useremailid eq '${userEmail}' and _crb5a_refclientid_value eq '${event?.crb5a_codeapps_eventdetailsid}'`
            });

            if (registrationsResult.success && registrationsResult.data && registrationsResult.data.length > 0) {

                setIsAlreadyRegistered(true);
            } else {
                setIsAlreadyRegistered(false);
            }
        } catch (error) {
            console.error('Error checking registration:', error);
        }
    };

    const handleRegisterClick = async () => {
     
        if (!event || !userEmail || isAlreadyRegistered) return;

        setIsLoading(true);
        try {
         
            const registrationData = {
                crb5a_useremailid: userEmail,
                "crb5a_RefClientID@odata.bind": `/crb5a_codeapps_eventdetailses(${event.crb5a_codeapps_eventdetailsid})`
            } as unknown as Omit<crb5a_codeapps_eventregistrations, "crb5a_codeapps_eventregistrationid">;
         
            const result = await crb5a_codeapps_eventregistrationsService.create(registrationData);

            if (result.success) {
                setIsAlreadyRegistered(true);
                setModalConfig({
                    title: 'Registration Successful',
                    body: 'You have successfully registered for this event!',
                    type: 'success'
                });
                setShowModal(true);
            } else {
                setModalConfig({
                    title: 'Registration Failed',
                    body: 'Failed to register for the event. Please try again.',
                    type: 'error'
                });
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error registering for event:', error);
            setModalConfig({
                title: 'Registration Error',
                body: 'An error occurred while registering. Please try again.',
                type: 'error'
            });
            setShowModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="banner-container"
            style={{
                backgroundImage: `url(${bannerImage})`,
            }}
        >
            <div className="banner-overlay"></div>
            <div className={event ? "banner-content-event" : "banner-content"}>
                <h1 className={event ? "banner-event-title" : "banner-main-title"}>
                    {event ? event.crb5a_title : "Transforming Skills for Tomorrow's Workforce"}
                </h1>
                <p className={event ? "banner-event-subtitle" : "banner-subtitle"}>
                    {event ? event.crb5a_maindescription : "Developed using Power Apps code apps"}
                </p>
                {event && (
                    <div className="banner-button-container">
                        <button
                            className="banner-back-button"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                        <button
                            className={isAlreadyRegistered ? "banner-register-button-registered" : "banner-register-button"}
                            onClick={handleRegisterClick}
                            disabled={isLoading || isAlreadyRegistered}
                        >
                            {isLoading ? 'Registering...' : isAlreadyRegistered ? 'Already Registered' : 'Register for Event'}
                        </button>
                    </div>
                )}
            </div>
            {!event && (
                <div className="developer-credit">
                    Developed by Giridhar Mungamuri
                </div>
            )}
            <ConfirmationPop
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={modalConfig.title}
                body={modalConfig.body}
                type={modalConfig.type}
            />
        </div>
    );
} 