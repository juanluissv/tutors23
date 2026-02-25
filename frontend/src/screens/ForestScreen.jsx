import React, { useState } from 'react'
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../App.css';
import { Link } from 'react-router-dom';




function ForestScreen() {


    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };



    return (
        <div className="chat-app">
            <div className="main-container">     

                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <div className="main-content">
                    <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                    <div className="content-area">
                        <div className="center-content2">
                            {/* content goes here */}
                            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
                                {/* Header */}
                                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                    <div style={{ display: 'inline-block', backgroundColor: '#e8f5e9', padding: '8px 24px', borderRadius: '20px', marginBottom: '16px' }}>
                                        <span style={{ color: '#2e7d32', fontSize: '14px', fontWeight: '500' }}>English Version</span>                                        
                                    </div>                                    
                                </div>
                                <Link to="/bosques" className='link25' >Spanish Version</Link>

                               

                                {/* Deepening */}
                                <div style={{ marginBottom: '60px' }}>

                                    <h3 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '20px' }}>Forests: importance and classification</h3>
                                    <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '16px' }}>
                                        Forests are complex ecosystems that play a vital role in human life. They cover about 31% of the world's land surface and perform various functions,
                                        including oxygen production, air purification, water supply and other natural resources, making them very important for maintaining the health and balance of the planet.
                                    </p>
                                    <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '24px' }}>
                                        The classification of forests is based on different criteria, such as the climatic zone in which they are located, the type of vegetation that makes them up, or their ecological function. In relation to the climatic zone,
                                        forests are divided into: tropical, subtropical, temperate and boreal. Of these, tropical zones stand out for having the largest proportion of forests worldwide, reaching 45%, while the rest is distributed among the other climatic zones.
                                    </p>

                                    {/* World distribution */}
                                    <div style={{ backgroundColor: '#f5f5f5', padding: '32px', borderRadius: '12px', marginBottom: '24px' }}>
                                        <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '24px', textAlign: 'center' }}>
                                            World distribution of forests by climatic zone
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', maxWidth: '600px', margin: '0 auto' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#2e7d32', marginBottom: '8px' }}>45%</div>
                                                <div style={{ fontSize: '16px', color: '#555' }}>Tropical</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1976d2', marginBottom: '8px' }}>27%</div>
                                                <div style={{ fontSize: '16px', color: '#555' }}>Boreal</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#f57c00', marginBottom: '8px' }}>16%</div>
                                                <div style={{ fontSize: '16px', color: '#555' }}>Temperate</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#c62828', marginBottom: '8px' }}>11%</div>
                                                <div style={{ fontSize: '16px', color: '#555' }}>Subtropical</div>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#777', marginTop: '24px', textAlign: 'center' }}>
                                            Source: FAO (2020). Global Forest Resources Assessment.
                                        </p>
                                    </div>

                                    {/* Geographic connection */}
                                    <div style={{ backgroundColor: '#e3f2fd', border: '2px solid #1976d2', borderRadius: '12px', padding: '20px', marginBottom: '40px' }}>
                                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#1976d2', marginBottom: '8px' }}>Geographic connection</p>
                                        <p style={{ fontSize: '15px', color: '#333', marginBottom: 0 }}>
                                            About 54% of the world's forests are concentrated in five nations: Russia, Brazil, Canada, the United States and China.
                                        </p>
                                    </div>

                                    {/* Characteristics of tropical forests */}
                                    <h3 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '20px' }}>Characteristics of tropical forests</h3>
                                    <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '16px' }}>
                                        Tropical forests are located in the intertropical zone and constitute one of the most important ecosystems worldwide. They are characterized by their warm and humid climate
                                        and experience abundant rainfall throughout the year, creating favourable conditions for plant and animal life.
                                    </p>
                                    <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '16px' }}>
                                        In addition, they stand out for harbouring an astonishing biological diversity, with approximately 60% of the known species of fauna and flora worldwide. However, in recent decades,
                                        deforestation has seriously threatened the health and stability of these forests, affecting entire regions.
                                    </p>

                                    {/* Main issues */}
                                    <h3 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1a1a1a', marginTop: '32px', marginBottom: '24px' }}>Main issues facing tropical forests</h3>
                                    <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '24px' }}>
                                        Tropical forests, despite their ecological importance, face various issues that put their existence at risk:
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                                        <div style={{ backgroundColor: '#fff', border: '2px solid #e0e0e0', borderRadius: '12px', padding: '24px' }}>
                                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🪓</div>
                                            <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>Deforestation</h4>
                                            <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#555', marginBottom: 0 }}>
                                                The process by which forest cover is removed or reduced on a large scale in a given area. It can be caused by human or natural activities.
                                            </p>
                                        </div>

                                        <div style={{ backgroundColor: '#fff', border: '2px solid #e0e0e0', borderRadius: '12px', padding: '24px' }}>
                                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏭</div>
                                            <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>Pollution</h4>
                                            <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#555', marginBottom: 0 }}>
                                                Occurs when chemical agents that alter the forest ecosystem are introduced, such as waste dumping and industrial emissions.
                                            </p>
                                        </div>

                                        <div style={{ backgroundColor: '#fff', border: '2px solid #e0e0e0', borderRadius: '12px', padding: '24px' }}>
                                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌡️</div>
                                            <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>Climate change</h4>
                                            <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#555', marginBottom: 0 }}>
                                                Significant variation in climate patterns that affects tropical forests, causing droughts, fires and floods.
                                            </p>
                                        </div>

                                        <div style={{ backgroundColor: '#fff', border: '2px solid #e0e0e0', borderRadius: '12px', padding: '24px' }}>
                                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🪵</div>
                                            <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>Overexploitation</h4>
                                            <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#555', marginBottom: 0 }}>
                                                Excessive logging and exploitation of forest resources without sustainable practices deplete resources and threaten natural regeneration.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Doc. 2 */}
                                    <div style={{ backgroundColor: '#fff3e0', border: '2px solid #f57c00', borderRadius: '12px', padding: '24px', marginBottom: '40px' }}>
                                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#e65100', marginBottom: '12px' }}>Doc. 2 — The impact of productive activities</p>
                                        <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '16px' }}>The impact of productive activities on deforestation</h4>
                                        <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#333', marginBottom: 0 }}>
                                            In a recent study, the FAO concluded that between 2000 and 2018, almost 90% of deforestation in tropical areas was related to agriculture (52.3% was due to the expansion of cropland and 37.5%
                                            to the expansion of livestock grazing land). Cropland caused more than 75% of deforestation in Africa and Asia. The most important cause in South America and Oceania was livestock grazing.
                                        </p>
                                        <p style={{ fontSize: '13px', color: '#777', marginTop: '16px', marginBottom: 0 }}>
                                            Source: FAO (2022). The State of the World's Forests.
                                        </p>
                                    </div>
                                </div>

                                {/* Regions affected */}
                                <div style={{ marginBottom: '60px' }}>
                                    <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '24px' }}>Regions affected by deforestation</h2>
                                    <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '16px' }}>
                                        The regions most affected by deforestation in tropical areas are located in South America, central Africa and Southeast Asia. In South America, deforestation is concentrated in the Amazon,
                                        which is the largest tropical forest in the world. In Africa, the Congo rainforest is threatened by the expansion of agriculture, livestock and mining.
                                    </p>
                                    <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '24px' }}>
                                        In Asia, deforestation occurs mainly in Indonesia, Malaysia and Myanmar, due to oil palm cultivation and overexploitation of wood for the paper industry.
                                        The conversion of tropical forests into agricultural plantations for the production of commercial crops, such as soy and oil palm, remains the most significant cause of deforestation worldwide.
                                    </p>
                                    <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '30px' }}>
                                        Soy is mainly used as feed for cattle, pigs and poultry, and as an ingredient in processed products. African or oil palm is cultivated to obtain palm oil,
                                        which is a common compound in many foods and cosmetic products. The expansion of land for grazing and livestock, as well as the paper industry and illegal timber extraction,
                                        which is often destined for international markets, also increases forest degradation and, ultimately, the risk of their disappearance.
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                                        <div style={{ backgroundColor: '#e8f5e9', border: '2px solid #2e7d32', borderRadius: '12px', padding: '24px' }}>
                                            <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1b5e20', marginBottom: '12px' }}>South America</h4>
                                            <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#333', marginBottom: 0 }}>
                                                Deforestation is concentrated in the Amazon, the largest tropical forest in the world. According to WWF, 18% of Amazonian forests have been completely lost and another 17% is degraded
                                                due to large-scale soy cultivation and the expansion of land for grazing.
                                            </p>
                                        </div>

                                        <div style={{ backgroundColor: '#fff3e0', border: '2px solid #f57c00', borderRadius: '12px', padding: '24px' }}>
                                            <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#e65100', marginBottom: '12px' }}>Central Africa</h4>
                                            <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#333', marginBottom: 0 }}>
                                                The Congo River basin (3.7 million km²) is the second largest tropical zone. The main cause is subsistence agriculture, followed by forestry and mining operations.
                                            </p>
                                        </div>

                                        <div style={{ backgroundColor: '#e3f2fd', border: '2px solid #1976d2', borderRadius: '12px', padding: '24px' }}>
                                            <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#0d47a1', marginBottom: '12px' }}>Southeast Asia</h4>
                                            <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#333', marginBottom: 0 }}>
                                                Palm oil production is the main cause, especially in Indonesia and Malaysia, which together produce 84% of the world's palm oil.
                                                Timber activities for the paper industry also have a significant impact.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Consolidation */}
                                <div style={{ marginBottom: '40px' }}>
                                    <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '32px' }}>Consolidation</h2>

                                    {/* Activity 6 */}
                                    <div style={{ backgroundColor: '#fff', border: '2px solid #e0e0e0', borderRadius: '16px', padding: '32px', marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                            <div style={{ backgroundColor: '#1976d2', color: 'white', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', flexShrink: 0 }}>6</div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>Pair activity</h4>
                                                <p style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>Conservation proposals</p>
                                                <p style={{ color: '#555', fontSize: '15px', marginBottom: 0 }}>
                                                    Establish three actions that can be carried out by different entities for the conservation of tropical forests worldwide, considering the main issues.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Activity 8 */}
                                    <div style={{ backgroundColor: '#fff', border: '2px solid #e0e0e0', borderRadius: '16px', padding: '32px', marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                            <div style={{ backgroundColor: '#1976d2', color: 'white', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', flexShrink: 0 }}>8</div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>Team activity</h4>
                                                <p style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>Research and presentation</p>
                                                <p style={{ color: '#555', fontSize: '15px', marginBottom: '16px' }}>
                                                    Identify and explain the issues facing tropical forests. Select one of the following forests:
                                                </p>

                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                                    <div style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                                                        <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>Amazon</h5>
                                                        <p style={{ fontSize: '14px', color: '#555', marginBottom: 0 }}>The largest tropical forest in the world.</p>
                                                    </div>
                                                    <div style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                                                        <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>The Congo</h5>
                                                        <p style={{ fontSize: '14px', color: '#555', marginBottom: 0 }}>Second largest tropical zone.</p>
                                                    </div>
                                                    <div style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                                                        <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>The Daintree</h5>
                                                        <p style={{ fontSize: '14px', color: '#555', marginBottom: 0 }}>Tropical rainforest of Australia.</p>
                                                    </div>
                                                    <div style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                                                        <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>Monteverde</h5>
                                                        <p style={{ fontSize: '14px', color: '#555', marginBottom: 0 }}>Cloud forest of Costa Rica.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </div>        
                </div>
            </div>
        </div>
    );
}

export default ForestScreen;