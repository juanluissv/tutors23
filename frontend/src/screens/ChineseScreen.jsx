import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import '../App.css'

function ChineseScreen () {
	const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [activeText, setActiveText] = useState('');
    const [allCues, setAllCues] = useState([]);
    const [audioLoading, setAudioLoading] = useState(true);
    const [videoLoading, setVideoLoading] = useState(true);
    const [isClassVideoPlaying, setIsClassVideoPlaying] = useState(false);
    const [questionText, setQuestionText] = useState('');
    
    const audioRef = useRef(null);
    const contentRef = useRef(null);
    const classVideoRef = useRef(null);
    const questionTextareaRef = useRef(null);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const loadVTT = async () => {
            try {
                const response = await fetch('/chinese.vtt');
                const vttText = await response.text();
                const cues = parseVTT(vttText);
                
                const filteredCues = cues.filter(cue => 
                    !cue.text.includes('TurboScribe') && 
                    !cue.text.includes('Go Unlimited')
                );
                
                setAllCues(filteredCues);
                console.log(`Loaded ${filteredCues.length} subtitle cues`);
            } catch (error) {
                console.error('Error loading VTT:', error);
            }
        };

        loadVTT();
    }, []);

    const parseVTT = (vttText) => {
        const lines = vttText.split('\n');
        const cues = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i].trim();
            
            if (line === 'WEBVTT' || line === '' || /^\d+$/.test(line)) {
                i++;
                continue;
            }

            if (line.includes('-->')) {
                const [startTime, endTime] = line.split('-->').map(t => t.trim());
                const start = parseTime(startTime);
                const end = parseTime(endTime);
                
                i++;
                let text = '';
                while (i < lines.length && lines[i].trim() !== '' && !lines[i].includes('-->')) {
                    text += lines[i].trim() + ' ';
                    i++;
                }
                
                cues.push({ start, end, text: text.trim() });
            } else {
                i++;
            }
        }

        return cues;
    };

    const parseTime = (timeString) => {
        const parts = timeString.split(':');
        if (parts.length === 3) {
            const hours = parseFloat(parts[0]);
            const minutes = parseFloat(parts[1]);
            const seconds = parseFloat(parts[2]);
            return hours * 3600 + minutes * 60 + seconds;
        }
        return 0;
    };

    const handleTimeUpdate = (currentTime) => {
        if (allCues.length === 0) return;

        const currentCue = allCues.find(
            cue => currentTime >= cue.start && currentTime < cue.end
        );

        if (currentCue && currentCue.text !== activeText) {
            setActiveText(currentCue.text);
            highlightMatchingText(currentCue.text);
        } else if (!currentCue && activeText) {
            setActiveText('');
            clearHighlights();
        }
    };

    const highlightMatchingText = (cueText) => {
        clearHighlights();
        
        if (!contentRef.current) return;
        
        const textElements = contentRef.current.querySelectorAll('p, h2, h3, h4');
        const searchText = cueText.toLowerCase().trim();
        
        textElements.forEach(element => {
            const elementText = element.textContent.toLowerCase();
            
            if (searchText.length > 20 && elementText.includes(searchText.substring(0, 30))) {
                element.classList.add('karaoke-active');
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    };

    const clearHighlights = () => {
        if (!contentRef.current) return;
        const highlighted = contentRef.current.querySelectorAll('.karaoke-active');
        highlighted.forEach(el => el.classList.remove('karaoke-active'));
    };

    const handleClassVideoToggle = () => {
        if (!classVideoRef.current) return;

        if (classVideoRef.current.paused || classVideoRef.current.ended) {
            classVideoRef.current.play();
            setIsClassVideoPlaying(true);
        } else {
            classVideoRef.current.pause();
            setIsClassVideoPlaying(false);
        }
    };

    const adjustQuestionTextareaHeight = (el) => {
        if (!el) return;
        el.style.height = 'auto';
        const minH = 52;
        const maxH = 200;
        el.style.height = Math.min(Math.max(el.scrollHeight, minH), maxH) + 'px';
    };

    const handleQuestionChange = (e) => {
        setQuestionText(e.target.value);
        adjustQuestionTextareaHeight(e.target);
    };

    const handleSendQuestion = () => {
        if (!questionText.trim()) {
            return;
        }

        if (classVideoRef.current) {
            classVideoRef.current.pause();
            setIsClassVideoPlaying(false);
        }

        const params = new URLSearchParams();
        params.set('query', questionText.trim());

        window.open(`/?${params.toString()}`, '_blank');
        setQuestionText('');
        if (questionTextareaRef.current) {
            questionTextareaRef.current.style.height = '52px';
        }
    };

	return (
		<div className='chat-app chat-app--valores-semana1'>
			<div className='main-container'>
				<Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
				<div className='main-content'>
					<Header
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div
						className='content-area content-area--valores-semana1'
						ref={contentRef}
					>
						<div className='center-content2 valores-semana1-center'>
							<div className='valores-semana1-lang-row'>
							<div className="valores-semana1-lang-pill">
                                    <Link
                                        to="/9/valores/unidad1/semana1"
                                        className="valores-semana1-lang-link"
                                    >
                                        Spanish Version
                                    </Link>
                                </div>
								<div className='valores-semana1-lang-pill'>
									<Link
										to='/forest'
										className='valores-semana1-lang-link'
									>
										English Version
									</Link>
								</div>
								<div className='valores-semana1-lang-pill'>
									<Link
										to='/french'
										className='valores-semana1-lang-link'
									>
										French Version
									</Link>
								</div>
							</div>
							<article className='valores-semana1-article-card'>
								<div
									className='valores-semana1-article-accent'
									aria-hidden
								/>
								<div className='unidad-wrapper valores-semana1-unidad-inner'>
									<div className='unidad-header valores-semana1-hero'>
										<p className='valores-semana1-eyebrow'>
											公民教育与价值观 · 九年级
										</p>
										<h1 className='unidad-title valores-semana1-title heading-gradient'>
											第一单元 · 第一周
										</h1>
										<h2 className='unidad-subtitle valores-semana1-subtitle'>
											世界热带森林
										</h2>
									</div>

									<section>
										<h3 className='unidad-section-title'>
											森林：重要性与分类
										</h3>
										<p className='unidad-paragraph'>
											森林是复杂的生态系统，对人类生存至关重要。它们约占全球陆地表面积的
											31%，并承担多种功能。
										</p>
										<p className='unidad-paragraph'>
											其中包括产氧、净化空气、提供淡水与其他自然资源，因此对维护地球健康与生态平衡极为重要。
										</p>
										<p className='unidad-paragraph'>
											森林的分类可依据多种标准，例如所处的气候带、构成森林的植被类型，或其生态功能。
										</p>
										<p className='unidad-paragraph unidad-paragraph-bottom'>
											按气候带来看，森林可分为热带、亚热带、温带与北方针叶林（寒温带）森林。其中热带地区在全球森林中所占比例最高，达
											45%；其余则分布于其他气候带。
										</p>

										<div className='unidad-chart-box'>
											<h4 className='unidad-chart-title'>
												世界森林按气候带的分布
											</h4>
											<div className='unidad-chart-grid'>
												<div className='unidad-chart-item'>
													<div className='unidad-chart-value tropical'>
														45%
													</div>
													<div className='unidad-chart-label'>
														热带
													</div>
												</div>
												<div className='unidad-chart-item'>
													<div className='unidad-chart-value boreal'>
														27%
													</div>
													<div className='unidad-chart-label'>
														北方针叶林
													</div>
												</div>
												<div className='unidad-chart-item'>
													<div className='unidad-chart-value templada'>
														16%
													</div>
													<div className='unidad-chart-label'>
														温带
													</div>
												</div>
												<div className='unidad-chart-item'>
													<div className='unidad-chart-value subtropical'>
														11%
													</div>
													<div className='unidad-chart-label'>
														亚热带
													</div>
												</div>
											</div>
											<p className='unidad-chart-footer'>
												来源：联合国粮农组织（2020）。《2020年全球森林资源评估》。
											</p>
										</div>

										<div className='unidad-info-box'>
											<p className='unidad-info-title'>
												地理联系
											</p>
											<p className='unidad-info-text'>
												全球约 54%
												的森林集中在五个国家：俄罗斯、巴西、加拿大、美国与中国。
											</p>
										</div>
									</section>

									<section>
										<h3 className='unidad-section-title'>
											热带森林的特征
										</h3>
										<p className='unidad-paragraph'>
											热带森林分布于热带地区，是世界上最重要的生态系统之一。
										</p>
										<p className='unidad-paragraph'>
											其特点是气候温暖湿润，全年降水充沛，为动植物生存创造了有利条件。
										</p>
										<p className='unidad-paragraph'>
											此外，这里拥有惊人的生物多样性，全球已知动植物物种中约有
											60% 生活于此。
										</p>
										<p className='unidad-paragraph unidad-paragraph-bottom'>
											然而近几十年来，森林砍伐严重威胁这些森林的健康与稳定，波及整片区域。
										</p>
									</section>

									<section>
										<h3 className='unidad-section-title'>
											热带森林的主要问题
										</h3>
										<p className='unidad-paragraph unidad-paragraph-bottom'>
											尽管热带森林生态意义重大，它们仍面临多种威胁其存续的问题：
										</p>

										<div className='unidad-problem-grid'>
											<div className='unidad-problem-card'>
												<h4 className='unidad-problem-title'>
													森林砍伐
												</h4>
												<p className='unidad-problem-text'>
													指在大范围内消除或减少某一地区森林覆盖的过程，可能由人类活动或自然因素引起。
												</p>
											</div>
											<div className='unidad-problem-card'>
												<h4 className='unidad-problem-title'>
													污染
												</h4>
												<p className='unidad-problem-text'>
													当废物倾倒、工业排放等将化学物质引入森林生态系统并改变其平衡时就会发生。
												</p>
											</div>
											<div className='unidad-problem-card'>
												<h4 className='unidad-problem-title'>
													气候变化
												</h4>
												<p className='unidad-problem-text'>
													指地球气候模式的显著变化，会影响热带森林，使其更易遭受干旱、火灾与洪水。
												</p>
											</div>
											<div className='unidad-problem-card'>
												<h4 className='unidad-problem-title'>
													过度开发
												</h4>
												<p className='unidad-problem-text'>
													过度采伐与不可持续的森林资源开发会耗尽资源，并威胁热带森林的自然再生能力。
												</p>
											</div>
										</div>

										<div className='unidad-doc-box'>
											<p className='unidad-doc-kicker'>
												资料 2 — 生产活动对森林砍伐的影响
											</p>
											<p className='unidad-doc-text'>
												联合国粮农组织近期一项研究指出：2000 年至 2018
												年间，热带地区近 90%
												的森林砍伐与农业相关（52.3% 来自耕地扩张，37.5%
												来自牧场扩张）。
											</p>
											<p className='unidad-doc-text'>
												耕地扩张导致了非洲与亚洲超过 75%
												的森林砍伐；在南美洲与大洋洲，最重要的原因是放牧。
											</p>
											<p className='unidad-doc-footer'>
												来源：联合国粮农组织（2022）。《2022年世界森林状况》。
											</p>
										</div>
									</section>

									<section>
										<h3 className='unidad-section-title'>
											热带森林中受森林砍伐影响的地区
										</h3>
										<p className='unidad-paragraph'>
											热带地区受森林砍伐影响最严重的区域位于南美洲、非洲中部与东南亚。
										</p>
										<p className='unidad-paragraph'>
											在南美洲，森林砍伐集中于亚马孙地区，那里拥有世界最大的热带森林。在非洲，刚果雨林因农业、畜牧业与采矿业的扩张而受到威胁。
										</p>
										<p className='unidad-paragraph unidad-paragraph-bottom'>
											在亚洲，森林砍伐主要发生在印度尼西亚、马来西亚与缅甸，原因包括油棕榈种植以及造纸工业对木材的过度开采。
										</p>

										<div className='unidad-regions-grid'>
											<div className='unidad-region-card green'>
												<h4 className='unidad-region-title green'>
													南美洲
												</h4>
												<p className='unidad-region-text'>
													森林砍伐集中于亚马孙地区。据世界自然基金会数据，18%
													的亚马孙森林已完全消失，另有 17%
													因大规模大豆种植、牧场扩张以及采矿与过度伐木而退化。
												</p>
											</div>
											<div className='unidad-region-card orange'>
												<h4 className='unidad-region-title orange'>
													非洲中部
												</h4>
												<p className='unidad-region-text'>
													刚果河流域面积约 370
													万平方公里，是世界第二大热带区域。森林砍伐的首要原因是自给农业，其次是工业化与小规模森林采伐以及采矿活动。
												</p>
											</div>
											<div className='unidad-region-card blue'>
												<h4 className='unidad-region-title blue'>
													东南亚
												</h4>
												<p className='unidad-region-text'>
													棕榈油生产是森林砍伐的主要原因，尤其在印度尼西亚与马来西亚，两国合计生产全球约
													84%
													的棕榈油。面向造纸工业的伐木以及刀耕火种等农业做法也产生重大影响。
												</p>
											</div>
										</div>
									</section>
								</div>
							</article>

						<div className="fixed-video-bottom-right valores-semana1-fixed-video">
						{/* <div className="fixed-video-bottom-right valores-semana1-floating-dock"> */}

							<div className="fixed-video-controls">
								<button 
									type="button" 
									className="fixed-video-button"
									onClick={handleClassVideoToggle}
									title={isClassVideoPlaying ? "Pause video" : "Play video"}
								>
									{isClassVideoPlaying ? (
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<rect x="6" y="4" width="4" height="16" />
											<rect x="14" y="4" width="4" height="16" />
										</svg>
									) : (
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<polygon points="5 3 19 12 5 21 5 3" />
										</svg>
									)}
								</button>
							</div>
							<div className="valores-semana1-circle-shell">
							<div className="fixed-video-wrapper">
								{videoLoading && (
									<div className="fixed-video-loading-overlay">
										<svg 
											width="28" 
											height="28" 
											viewBox="0 0 24 24" 
											fill="none" 
											stroke="#ffffff" 
											strokeWidth="2" 
											className="audio-loading-spinner"
										>
											<circle 
												cx="12" 
												cy="12" 
												r="10" 
												strokeOpacity="0.25" 
											/>
											<path 
												d="M12 2a10 10 0 0 1 10 10" 
												strokeLinecap="round" 
											/>
										</svg>
									</div>
								)}
								<video 
									ref={classVideoRef}
									src="/chinese2.mp4"     
									controls={false}
									onLoadedData={() => setVideoLoading(false)}
									onLoadStart={() => setVideoLoading(true)}
									onError={() => setVideoLoading(false)}
									onPlay={() => setIsClassVideoPlaying(true)}
									onPause={() => setIsClassVideoPlaying(false)}
									onTimeUpdate={(e) => handleTimeUpdate(e.target.currentTime)}
								/>
								<div className="fixed-video-question-wrap valores-semana1-question-wrap">
									<textarea
										ref={questionTextareaRef}
										rows={2}
										className="fixed-video-question-input valores-semana1-question-input"
										placeholder="问我一个问题"
										value={questionText}
										onChange={handleQuestionChange}
									/>
									<button
										type="button"
										className="fixed-video-question-send valores-semana1-question-send"
										onClick={handleSendQuestion}
										aria-label="Enviar pregunta"
									>
										<svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<line x1="22" y1="2" x2="11" y2="13" />
											<polygon points="22 2 15 22 11 13 2 9 22 2" />
										</svg>
									</button>
								</div>
							</div>
							</div>

							{/* <button
								type="button"
								className='valores-semana1-exam-btn'
							>
							<Link
								to="/examen"
								className="valores-semana1-exam-btn-link"
								target="_blank"
								rel="noopener noreferrer"
							>
								Examen <br /> de práctica
							</Link>
							</button> */}
						</div>
						<div className="valores-semana1-feature-wrap">
						<video
							className="valores-semana1-feature-video unidad-video"
                            src="https://res.cloudinary.com/dutglmj02/video/upload/q_auto/f_auto/v1776197571/chineseLesson_gkzs1l.mp4"
                            controls
                            onLoadedData={() => setVideoLoading(false)}
                            onLoadStart={() => setVideoLoading(true)}
                            onError={() => setVideoLoading(false)}
                            style={{
                            width: '100%',
                            height: 'auto',
                            display: videoLoading ? 'none' : 'block'
                            }}
                        />
						</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ChineseScreen