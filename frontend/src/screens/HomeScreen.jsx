import '../App.css';
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
} from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useGetChatMutation } from '../slices/chatSlice';
import {
  useGetProfileQuery,
  useGetMySubjectsQuery,
  useGetBookLessonsBySubjectForStudentQuery,
} from '../slices/student/studentApiSlice';
import StudentSubscriptionNotice from '../components/StudentSubscriptionNotice';
import {
  resolveCurrentSubscription,
  canViewQuestions,
  getSubscriptionBlockReason,
  subscriptionNeedsSubjectSelection,
} from '../utils/subscriptionAccess';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


// Arrow icon uses currentColor so the send button can style it (brand / disabled)
const SendButtonIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="send-button-icon"
    aria-hidden
  >
    <path
      d="M10 4v12M4 10l6-6 6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

function getChatErrorMessage (error) {
  return (
    error?.data?.message
    || error?.error
    || 'Lo siento, hubo un error al procesar tu pregunta.'
  );
}

function resolveChapterChatIndexId (chapter, subjectId) {
  const pineconeIndex = String(chapter?.pineconeIndexName ?? '').trim()
  if (pineconeIndex) {
    return pineconeIndex
  }

  const chapterId = String(chapter?._id ?? '').trim()
  if (chapterId) {
    return `${String(subjectId)}-${chapterId}`
  }

  return String(subjectId)
}

function bookDisplayName (bookId) {
  if (!bookId || typeof bookId !== 'string') {
    return ''
  }
  const trimmed = bookId.trim()
  const parts = trimmed.split('/')
  const last = parts[parts.length - 1]
  return last && last.length > 0 ? last : trimmed
}

function stripPdfExtension (name) {
  const trimmed = String(name ?? '').trim()
  if (!trimmed) {
    return trimmed
  }
  return trimmed.replace(/\.pdf$/i, '')
}

function documentDisplayName (doc) {
  if (doc?.fileName) {
    return stripPdfExtension(String(doc.fileName))
  }
  if (doc?.label) {
    return stripPdfExtension(String(doc.label))
  }
  if (doc?.fileId) {
    return stripPdfExtension(bookDisplayName(String(doc.fileId)))
  }
  return 'Document'
}

function getDocumentKey (doc) {
  if (doc?._id) {
    return String(doc._id)
  }
  if (doc?.fileId) {
    return String(doc.fileId)
  }
  return ''
}

function getSubjectDocuments (subject) {
  if (Array.isArray(subject?.documents) && subject.documents.length > 0) {
    return subject.documents
  }
  if (subject?.bookId && String(subject.bookId).trim() !== '') {
    return [{
      _id: null,
      fileId: String(subject.bookId).trim(),
      fileName: bookDisplayName(String(subject.bookId)),
      fileUrl: subject.bookUrl,
    }]
  }
  return []
}

function chapterBelongsToDocument (
  chapter,
  documentKey,
  requiresSourceDocument,
) {
  if (!requiresSourceDocument) {
    return true
  }
  if (!documentKey) {
    return false
  }
  return String(chapter.sourceDocumentId || '') === String(documentKey)
}

function getSubjectChapters (subject, mySubjectsById) {
  const subjectId = String(subject?._id ?? '')
  const fullSubject = mySubjectsById.get(subjectId) || subject
  const chapters = Array.isArray(fullSubject?.bookChapters)
    ? fullSubject.bookChapters
    : []

  return chapters
    .filter((chapter) => String(chapter?.ChapterTitle || '').trim())
    .sort((a, b) => {
      const aNum = Number(a?.ChapterNumber)
      const bNum = Number(b?.ChapterNumber)
      if (Number.isFinite(aNum) && Number.isFinite(bNum)) {
        return aNum - bNum
      }
      return 0
    })
}

function getDocumentChapters (
  subject,
  documentKey,
  mySubjectsById,
) {
  const subjectId = String(subject?._id ?? '')
  const fullSubject = mySubjectsById.get(subjectId) || subject
  const documents = getSubjectDocuments(fullSubject)
  const requiresSourceDocument = documents.length > 1
  const allChapters = getSubjectChapters(subject, mySubjectsById)

  return allChapters.filter((chapter) => chapterBelongsToDocument(
    chapter,
    documentKey,
    requiresSourceDocument,
  ))
}

function resolveChapterDocumentId (chapter, subject, mySubjectsById) {
  const subjectId = String(subject?._id ?? '')
  const fullSubject = mySubjectsById.get(subjectId) || subject
  const documents = getSubjectDocuments(fullSubject)
  const sourceDocumentId = String(chapter?.sourceDocumentId ?? '').trim()

  if (sourceDocumentId) {
    return sourceDocumentId
  }

  if (documents.length === 1) {
    return getDocumentKey(documents[0])
  }

  return null
}

function isChapterBubbleActive (routeId, chapter, subjectId) {
  if (routeId == null) {
    return false
  }

  return String(routeId) === resolveChapterChatIndexId(chapter, subjectId)
}

function findLessonForChapter (bookLessons, chapter) {
  if (!Array.isArray(bookLessons) || !chapter) {
    return null
  }

  const chapterId = String(chapter?._id ?? '').trim()
  const chapterNumber = Number(chapter?.ChapterNumber)
  const chapterTitle = String(chapter?.ChapterTitle ?? '').trim().toLowerCase()

  return bookLessons.find((lesson) => {
    const bookChapter = lesson?.bookChapter || {}
    const lessonChapterId = String(bookChapter.chapterId ?? '').trim()

    if (chapterId && lessonChapterId && lessonChapterId === chapterId) {
      return true
    }

    if (
      Number.isFinite(chapterNumber)
      && Number(bookChapter.chapterNumber) === chapterNumber
    ) {
      return true
    }

    const lessonTitle = String(bookChapter.chapterTitle ?? '')
      .trim()
      .toLowerCase()

    return Boolean(chapterTitle && lessonTitle && lessonTitle === chapterTitle)
  }) || null
}

function collectSubjectsById (...subjectLists) {
  const byId = new Map()

  for (const list of subjectLists) {
    if (!Array.isArray(list)) {
      continue
    }

    for (const subject of list) {
      if (!subject) {
        continue
      }

      const subjectId = String(subject._id || '').trim()
      const title = String(subject.title || '').trim()

      if (!subjectId || !title) {
        continue
      }

      byId.set(subjectId, {
        ...subject,
        _id: subjectId,
        title,
      })
    }
  }

  return byId
}

function HomeScreen() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { studentInfo } = useSelector((state) => state.authStudent);
  const isExamRoute =
    location.pathname === '/exam' || location.pathname === '/examen';

  const {
    data: profile,
    isLoading: isLoadingProfile,
  } = useGetProfileQuery(undefined, {
    skip: !studentInfo,
  });

  const {
    data: mySubjects = [],
    isLoading: isLoadingMySubjects,
  } = useGetMySubjectsQuery(undefined, {
    skip: !studentInfo,
  });

  const currentSubscription = useMemo(
    () => resolveCurrentSubscription(profile?.subscriptions),
    [profile?.subscriptions],
  );
  const canUseAiTutor = canViewQuestions(currentSubscription);
  const aiTutorBlockReason = getSubscriptionBlockReason(
    currentSubscription,
    'view',
  );

  const mySubjectsById = useMemo(() => {
    const map = new Map()
    for (const subject of mySubjects) {
      if (subject?._id) {
        map.set(String(subject._id), subject)
      }
    }
    return map
  }, [mySubjects])

  const subscribedSubjects = useMemo(() => {
    const planSubjectsFromProfile = (profile?.plans || []).flatMap(
      (plan) => (Array.isArray(plan?.subjects) ? plan.subjects : []),
    )
    const subjectsById = collectSubjectsById(
      mySubjects,
      profile?.subjects,
      planSubjectsFromProfile,
      currentSubscription?.plan?.subjects,
      currentSubscription?.selectedSubjects,
    )

    const planSubjectIds = (
      currentSubscription?.plan?.subjects || []
    )
      .map((subject) => String(subject?._id || subject || '').trim())
      .filter(Boolean)
    const selectedSubjectIds = (
      currentSubscription?.selectedSubjects || []
    )
      .map((subject) => String(subject?._id || subject || '').trim())
      .filter(Boolean)
    const subscriptionSubjectIds = [
      ...planSubjectIds,
      ...selectedSubjectIds,
    ]

    if (subscriptionSubjectIds.length > 0) {
      const fromSubscription = subscriptionSubjectIds
        .map((subjectId) => subjectsById.get(subjectId))
        .filter(Boolean)

      if (fromSubscription.length > 0) {
        return fromSubscription
      }
    }

    return [...subjectsById.values()]
  }, [
    mySubjects,
    profile?.subjects,
    profile?.plans,
    currentSubscription?.plan?.subjects,
    currentSubscription?.selectedSubjects,
  ])

  const [selectedSubjectId, setSelectedSubjectId] = useState(null)
  const [selectedDocumentId, setSelectedDocumentId] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)

  const selectedSubject = useMemo(() => {
    if (!selectedSubjectId) {
      return null
    }

    return (
      subscribedSubjects.find(
        (subject) => String(subject._id) === String(selectedSubjectId),
      ) || null
    )
  }, [selectedSubjectId, subscribedSubjects])

  const selectedSubjectDocuments = useMemo(() => {
    if (!selectedSubject) {
      return []
    }

    const fullSubject = (
      mySubjectsById.get(String(selectedSubject._id)) || selectedSubject
    )
    return getSubjectDocuments(fullSubject)
  }, [selectedSubject, mySubjectsById])

  const hasSingleSubjectDocument = selectedSubjectDocuments.length === 1

  const effectiveDocumentId = useMemo(() => {
    if (selectedDocumentId) {
      return selectedDocumentId
    }

    if (!hasSingleSubjectDocument) {
      return null
    }

    return getDocumentKey(selectedSubjectDocuments[0]) || null
  }, [
    selectedDocumentId,
    selectedSubjectDocuments,
    hasSingleSubjectDocument,
  ])

  const selectedDocument = useMemo(() => {
    if (!effectiveDocumentId) {
      return null
    }

    return selectedSubjectDocuments.find(
      (doc) => getDocumentKey(doc) === String(effectiveDocumentId),
    ) || null
  }, [effectiveDocumentId, selectedSubjectDocuments])

  const selectedDocumentChapters = useMemo(() => {
    if (!selectedSubject || !effectiveDocumentId) {
      return []
    }

    return getDocumentChapters(
      selectedSubject,
      effectiveDocumentId,
      mySubjectsById,
    )
  }, [selectedSubject, effectiveDocumentId, mySubjectsById])

  const activePineconeIndexId = useMemo(() => {
    const routeIndexId = String(id ?? '').trim()
    if (routeIndexId) {
      return routeIndexId
    }
    return null
  }, [id])

  const {
    data: bookLessons = [],
    isLoading: isLoadingBookLessons,
    isError: isBookLessonsError,
  } = useGetBookLessonsBySubjectForStudentQuery(selectedSubjectId, {
    skip: !studentInfo || !selectedSubjectId,
  })

  const selectedChapterLesson = useMemo(() => {
    if (!selectedChapter?.chapter) {
      return null
    }

    return findLessonForChapter(bookLessons, selectedChapter.chapter)
  }, [bookLessons, selectedChapter])

  const selectedChapterQuestions = useMemo(() => {
    if (!selectedChapter?.chapter) {
      return []
    }

    const items = Array.isArray(selectedChapterLesson?.suggestedQuestions)
      ? selectedChapterLesson.suggestedQuestions
      : []

    return items
      .map((item) => ({
        question: String(item?.question ?? '').trim(),
        answer: String(item?.answer ?? '').trim(),
      }))
      .filter((item) => item.question)
  }, [selectedChapter, selectedChapterLesson])

  const effectivePineconeIndexId = useMemo(() => {
    if (activePineconeIndexId) {
      return activePineconeIndexId
    }

    const lessonChatIndexId = String(
      selectedChapterLesson?.chatIndexId ?? '',
    ).trim()
    if (lessonChatIndexId) {
      return lessonChatIndexId
    }

    if (selectedChapter?.chatIndexId) {
      return String(selectedChapter.chatIndexId).trim()
    }

    return null
  }, [
    activePineconeIndexId,
    selectedChapter,
    selectedChapterLesson,
  ])

    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [showSubheading, setShowSubheading] = useState(false);
    const [playingAudio, setPlayingAudio] = useState(null); // Track which message is playing audio
    const [loadingAudio, setLoadingAudio] = useState(null); // Track which message is loading audio
    const messagesEndRef = useRef(null);
    const audioRef = useRef(null);
    const abortControllerRef = useRef(null);
    const audioUrlRef = useRef(null);
    const audioEventHandlersRef = useRef({ onended: null, onerror: null });
    const chatGenerationRef = useRef(0);
    const [predefinedQuestion, setPredefinedQuestion] = useState('');
    const [learningMaterial, setLearningMaterial] = useState(
      '¿Qué vas a aprender hoy?',
    );
    const [showQuestions, setShowQuestions] = useState(false);
    const [hasSentQueryFromUrl, setHasSentQueryFromUrl] = useState(false);
    const hasMountedRef = useRef(false);

    const [getChat, { isLoading }] = useGetChatMutation();

    const sendChatQuestion = async (questionText) => {
      const trimmedQuestion = String(questionText ?? '').trim()
      if (!trimmedQuestion) {
        return null
      }

      const pineconeIndexId = String(effectivePineconeIndexId ?? '').trim()
      if (!pineconeIndexId) {
        toast.error(
          'Selecciona un capítulo antes de hacer una pregunta.',
        )
        return null
      }

      const lessonId = String(selectedChapterLesson?._id ?? '').trim()

      return getChat({
        question: trimmedQuestion,
        id: pineconeIndexId,
        lessonId: lessonId || undefined,
      })
    }

    useEffect(() => {
      if (!studentInfo) {
        const next = encodeURIComponent(
          location.pathname + location.search,
        );
        navigate(`/login?redirect=${next}`, { replace: true });
      }
    }, [studentInfo, navigate, location.pathname, location.search]);

    const cleanupAudio = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        if (audioRef.current) {
            const audio = audioRef.current;
            audio.pause();
            
            if (audioEventHandlersRef.current.onended) {
                audio.removeEventListener('ended', audioEventHandlersRef.current.onended);
            }
            if (audioEventHandlersRef.current.onerror) {
                audio.removeEventListener('error', audioEventHandlersRef.current.onerror);
            }
            audioEventHandlersRef.current = { onended: null, onerror: null };
            
            audio.src = '';
            audio.load();
            audioRef.current = null;
        }

        if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
        }

        setPlayingAudio(null);
        setLoadingAudio(null);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Close sidebar when clicking outside on mobile
    const closeSidebarOnMobile = () => {
        if (window.innerWidth <= 768 && isSidebarOpen) {
            setIsSidebarOpen(false);
        }
    };

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Handle window resize for responsive sidebar behavior
    useEffect(() => {
        const handleResize = () => {
            // On desktop, keep sidebar open; on mobile, close it
            if (window.innerWidth > 768 && !isSidebarOpen) {
                setIsSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isSidebarOpen]);

    // Show subheading after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSubheading(true);
        }, 3000); // 3000ms = 3 seconds

        return () => clearTimeout(timer); // Cleanup on unmount
    }, []);

    // When there is a query in the URL, prefill and auto-send it once
    useEffect(() => {
        if (isLoadingProfile || !canUseAiTutor) {
          return;
        }

        const queryFromUrl = searchParams.get('query');
        const trimmedQuery = queryFromUrl ? queryFromUrl.trim() : "";

        if (trimmedQuery && !hasSentQueryFromUrl) {
            setQuestion(trimmedQuery);

            const sendFromUrl = async () => {
                const generation = chatGenerationRef.current + 1
                chatGenerationRef.current = generation
                const userMessage = { type: 'question', content: trimmedQuery };
                setMessages(prev => [...prev, userMessage]);
                try {
                    const res = await sendChatQuestion(trimmedQuery)
                    if (chatGenerationRef.current !== generation) {
                      return
                    }
                    if (!res) {
                      setMessages((prev) => prev.slice(0, -1))
                      return
                    }

                    const aiMessage = { type: 'answer', content: res.data.message };
                    setMessages(prev => [...prev, aiMessage]);
                } catch (error) {
                    if (chatGenerationRef.current !== generation) {
                      return
                    }
                    console.error(error);
                    const errorMessage = {
                      type: 'answer',
                      content: getChatErrorMessage(error),
                    };
                    setMessages(prev => [...prev, errorMessage]);
                } finally {
                    if (chatGenerationRef.current === generation) {
                      setQuestion("");
                    }
                    setHasSentQueryFromUrl(true);
                }
            };

            sendFromUrl();
        }
    }, [
      searchParams,
      hasSentQueryFromUrl,
      id,
      getChat,
      canUseAiTutor,
      isLoadingProfile,
      effectivePineconeIndexId,
    ]);


    // Cleanup audio on component unmount
    useEffect(() => {
        return () => {
            cleanupAudio();
        };
    }, []);
   

    useEffect(() => {
      if (id == 'langchain-docs') {
        setPredefinedQuestion(
          'Sugiéreme algunas preguntas sobre el '
          + 'informe de accionistas de Warren Buffett',
        );
        setLearningMaterial('¿Qué vas a aprender hoy?');
      } else {
        setPredefinedQuestion(
          'Soy un Tutor de AI especializado \n En el libro de Ciudadania y Valores 9 grado El Salvador,\n Sugiereme algo que preguntar ',
        );
        setLearningMaterial('¿Qué vas a aprender hoy?');
      }
    }, [id]);

    useEffect(() => {
      if (!id) {
        return
      }

      for (const subject of subscribedSubjects) {
        const subjectId = String(subject._id)
        const chapters = getSubjectChapters(subject, mySubjectsById)

        for (const chapter of chapters) {
          if (isChapterBubbleActive(id, chapter, subjectId)) {
            setSelectedSubjectId(subjectId)
            const documentId = resolveChapterDocumentId(
              chapter,
              subject,
              mySubjectsById,
            )
            if (documentId) {
              setSelectedDocumentId(documentId)
            }
            return
          }
        }
      }
    }, [id, subscribedSubjects, mySubjectsById]);

    useEffect(() => {
      const shouldShowQuestions = searchParams.get('questions') === '1'
      const subjectIdParam = String(searchParams.get('subjectId') ?? '').trim()
      const chapterIdParam = String(searchParams.get('chapterId') ?? '').trim()

      if (!shouldShowQuestions || !subjectIdParam || !chapterIdParam) {
        return
      }

      if (isLoadingProfile || isLoadingMySubjects) {
        return
      }

      const subject = subscribedSubjects.find(
        (item) => String(item._id) === subjectIdParam,
      )
      if (!subject) {
        return
      }

      const chapters = getSubjectChapters(subject, mySubjectsById)
      const chapter = chapters.find(
        (item) => String(item._id) === chapterIdParam,
      )
      if (!chapter) {
        return
      }

      setSelectedSubjectId(subjectIdParam)
      const documentId = resolveChapterDocumentId(
        chapter,
        subject,
        mySubjectsById,
      )
      if (documentId) {
        setSelectedDocumentId(documentId)
      }
      setSelectedChapter({
        chapter,
        subjectId: subjectIdParam,
        chatIndexId: resolveChapterChatIndexId(chapter, subjectIdParam),
        title: String(chapter?.ChapterTitle || '').trim(),
      })

      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('questions')
      nextParams.delete('subjectId')
      nextParams.delete('chapterId')
      const nextSearch = nextParams.toString()
      navigate(
        `${location.pathname}${nextSearch ? `?${nextSearch}` : ''}`,
        { replace: true },
      )
    }, [
      searchParams,
      subscribedSubjects,
      mySubjectsById,
      isLoadingProfile,
      isLoadingMySubjects,
      navigate,
      location.pathname,
    ]);

    // Clear chat history and cleanup audio when switching subjects (but not on first mount)
    useEffect(() => {
      if (!hasMountedRef.current) {
        hasMountedRef.current = true;
        return;
      }

      cleanupAudio();
      chatGenerationRef.current += 1
      setMessages([]);
      setShowSubheading(false);
      setShowQuestions(false);
      setHasSentQueryFromUrl(false);
      
      // Reset subheading timer
      const timer = setTimeout(() => {
        setShowSubheading(true);
      }, 3000);

      return () => clearTimeout(timer);
    }, [id]);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        if (!canUseAiTutor) {
          toast.error(aiTutorBlockReason);
          return;
        }

        const generation = chatGenerationRef.current + 1
        chatGenerationRef.current = generation
        const userMessage = { type: 'question', content: question };
        setMessages(prev => [...prev, userMessage]);
        
        const currentQuestion = question;
        setQuestion("");
        try {
          const res = await sendChatQuestion(currentQuestion)
          if (chatGenerationRef.current !== generation) {
            return
          }
          if (!res) {
            setMessages((prev) => prev.slice(0, -1))
            return
          }

          const aiMessage = { type: 'answer', content: res.data.message };
          setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            if (chatGenerationRef.current !== generation) {
              return
            }
            console.error(error);
            const errorMessage = {
              type: 'answer',
              content: getChatErrorMessage(error),
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    }

    const handleSubjectBubbleClick = (subject) => {
      if (!canUseAiTutor) {
        toast.error(aiTutorBlockReason)
        return
      }

      const subjectId = String(subject._id)
      const fullSubject = mySubjectsById.get(subjectId) || subject
      const documents = getSubjectDocuments(fullSubject)
      const onlyDocumentId = documents.length === 1
        ? getDocumentKey(documents[0])
        : null

      setSelectedChapter(null)
      setSelectedDocumentId(onlyDocumentId || null)
      setSelectedSubjectId(subjectId)
    }

    const handleBackToSubjects = () => {
      setSelectedSubjectId(null)
      setSelectedDocumentId(null)
      setSelectedChapter(null)
    }

    const handleBackToDocuments = () => {
      if (selectedSubjectDocuments.length <= 1) {
        handleBackToSubjects()
        return
      }

      setSelectedDocumentId(null)
      setSelectedChapter(null)
    }

    const handleBackToChapters = () => {
      setSelectedChapter(null)
    }

    const handleBackFromChat = () => {
      chatGenerationRef.current += 1
      cleanupAudio()
      setMessages([])
      setQuestion('')
    }

    const handleDocumentBubbleClick = (doc) => {
      if (!canUseAiTutor) {
        toast.error(aiTutorBlockReason)
        return
      }

      setSelectedChapter(null)
      setSelectedDocumentId(getDocumentKey(doc))
    }

    const handleChapterBubbleClick = (chapter, subjectId) => {
      if (!canUseAiTutor) {
        toast.error(aiTutorBlockReason)
        return
      }

      const chatIndexId = resolveChapterChatIndexId(chapter, subjectId)

      setSelectedChapter({
        chapter,
        subjectId: String(subjectId),
        chatIndexId,
        title: String(chapter?.ChapterTitle || '').trim(),
      })
    }

    const handleQuestionClick = async (selectedQuestion) => {
        if (!canUseAiTutor) {
          toast.error(aiTutorBlockReason);
          return;
        }

        const generation = chatGenerationRef.current + 1
        chatGenerationRef.current = generation
        const userMessage = { type: 'question', content: selectedQuestion };
        setMessages(prev => [...prev, userMessage]);

        try {
          const res = await sendChatQuestion(selectedQuestion)
          if (chatGenerationRef.current !== generation) {
            return
          }
          if (!res) {
            setMessages((prev) => prev.slice(0, -1))
            return
          }

          const aiMessage = { type: 'answer', content: res.data.message };
          setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            if (chatGenerationRef.current !== generation) {
              return
            }
            console.error(error);
            const errorMessage = {
              type: 'answer',
              content: getChatErrorMessage(error),
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    }

    const playAudio = async (text, messageIndex) => {
        if (!canUseAiTutor) {
          toast.error(aiTutorBlockReason);
          return;
        }

        try {
            // If clicking the same message that's playing or loading, just stop it
            if (playingAudio === messageIndex || loadingAudio === messageIndex) {
                cleanupAudio();
                return;
            }

            // Clean up any previous audio before starting new one
            cleanupAudio();

            // Set loading state
            setLoadingAudio(messageIndex);

            // Create new abort controller for this request
            abortControllerRef.current = new AbortController();

            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ text }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                let message = 'No se pudo generar el audio';
                try {
                    const errBody = await response.json();
                    if (errBody?.message) {
                        message = errBody.message;
                    }
                } catch {
                    /* ignore parse errors */
                }
                toast.error(message);
                throw new Error(message);
            }

            // Get the blob directly (MP3 format for better streaming)
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            audioUrlRef.current = audioUrl;
            
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            const handleEnded = () => {
                cleanupAudio();
            };

            const handleError = () => {
                console.error('Error playing audio');
                cleanupAudio();
            };

            audioEventHandlersRef.current = { onended: handleEnded, onerror: handleError };
            audio.addEventListener('ended', handleEnded);
            audio.addEventListener('error', handleError);

            // Audio is ready, switch from loading to playing
            setLoadingAudio(null);
            setPlayingAudio(messageIndex);
            await audio.play();
        } catch (error) {
            if (error.name === 'AbortError') {
                return;
            }
            console.error('Error generating speech:', error);
            cleanupAudio();
        }
    };



  if (!studentInfo) {
    return null;
  }

  const inputDisabled = isLoading || isLoadingProfile || !canUseAiTutor;

  return (
    <div className="chat-app ask-screen chat-app--home">
      <div className="main-container">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        
        {/* Overlay for mobile - click to close sidebar */}
        {isSidebarOpen && window.innerWidth <= 768 && (
          <div className="sidebar-overlay" onClick={closeSidebarOnMobile}></div>
        )}

        {/* Main Content */}
        <div className="main-content">
          <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

          <div className="content-area content-area--home">
            {!isLoadingProfile && !canUseAiTutor ? (
              <StudentSubscriptionNotice
                subscription={currentSubscription}
                className="ask-subscription-notice--home"
                extraText={
                  subscriptionNeedsSubjectSelection(currentSubscription)
                    ? undefined
                    : 'Una suscripción activa desbloquea el tutor de IA '
                      + 'en esta página.'
                }
              />
            ) : null}

            {messages.length === 0 ? (
              <div className="home-hub">
                <div className="home-hub__card">
                  <div className="home-hub__accent" aria-hidden />
                  <div className="home-hub__hero">
                    <h1 className="home-hub__title heading-gradient">
                      {learningMaterial}
                    </h1>
                    <div className="home-hub__subjects-wrap">
                      {isLoadingProfile || isLoadingMySubjects ? (
                        <div
                          className="home-hub__subjects home-hub__subjects--loading"
                          aria-hidden
                        >
                          <span className="home-hub__subject-bubble home-hub__subject-bubble--skeleton" />
                          <span className="home-hub__subject-bubble home-hub__subject-bubble--skeleton" />
                          <span className="home-hub__subject-bubble home-hub__subject-bubble--skeleton" />
                        </div>
                      ) : subscribedSubjects.length > 0 ? (
                        <div className="home-hub__subjects">
                          {selectedSubject ? (
                            <>
                              <button
                                type="button"
                                className="home-hub__back-btn animate-fade-in"
                                onClick={
                                  selectedChapter
                                    ? handleBackToChapters
                                    : effectiveDocumentId
                                      && !hasSingleSubjectDocument
                                      ? handleBackToDocuments
                                      : handleBackToSubjects
                                }
                              >
                                {selectedChapter
                                  ? '← Volver a capítulos'
                                  : effectiveDocumentId
                                    && !hasSingleSubjectDocument
                                    ? '← Volver a documentos'
                                    : '← Volver a materias'}
                              </button>
                              {selectedChapter ? (
                                <div
                                  className={
                                    'home-hub__questions ' +
                                    'home-hub__questions--solo animate-fade-in'
                                  }
                                >
                                  <p className="home-hub__questions-label">
                                    Preguntas sugeridas
                                  </p>
                                  <p className="home-hub__questions-subtitle">
                                    {selectedChapter.title}
                                  </p>
                                  {isLoadingBookLessons ? (
                                    <div
                                      className="home-hub__questions-list"
                                      aria-hidden
                                    >
                                      {Array.from({ length: 6 }).map(
                                        (_, index) => (
                                          <span
                                            key={index}
                                            className={
                                              'home-hub__question-bubble ' +
                                              'home-hub__question-bubble--skeleton'
                                            }
                                          />
                                        ),
                                      )}
                                    </div>
                                  ) : isBookLessonsError ? (
                                    <p className="home-hub__questions-empty">
                                      No se pudieron cargar las preguntas de
                                      este capítulo. Intenta de nuevo.
                                    </p>
                                  ) : selectedChapterQuestions.length > 0 ? (
                                    <div
                                      className="home-hub__questions-list"
                                      role="list"
                                      aria-label={
                                        `Preguntas sugeridas de ${
                                          selectedChapter.title
                                        }`
                                      }
                                    >
                                      {selectedChapterQuestions.map(
                                        (item, index) => (
                                          <button
                                            key={`${index}-${item.question.slice(
                                              0,
                                              24,
                                            )}`}
                                            type="button"
                                            role="listitem"
                                            className="home-hub__question-bubble"
                                            onClick={() => handleQuestionClick(
                                              item.question,
                                            )}
                                          >
                                            <span
                                              className={
                                                'home-hub__question-bubble-index'
                                              }
                                              aria-hidden
                                            >
                                              {index + 1}
                                            </span>
                                            <span
                                              className={
                                                'home-hub__question-bubble-text'
                                              }
                                            >
                                              {item.question}
                                            </span>
                                          </button>
                                        ),
                                      )}
                                    </div>
                                  ) : (
                                    <p className="home-hub__questions-empty">
                                      Este capítulo aún no tiene preguntas
                                      sugeridas disponibles.
                                    </p>
                                  )}
                                </div>
                              ) : effectiveDocumentId ? (
                                selectedDocumentChapters.length > 0 ? (
                                  <div
                                    className={
                                      'home-hub__chapters ' +
                                      'home-hub__chapters--solo animate-fade-in'
                                    }
                                  >
                                    <p className="home-hub__chapters-label">
                                      Capítulos de{' '}
                                      {hasSingleSubjectDocument
                                        ? selectedSubject.title
                                        : selectedDocument
                                          ? documentDisplayName(
                                            selectedDocument,
                                          )
                                          : selectedSubject.title}
                                    </p>
                                    <div
                                      className="home-hub__chapters-list"
                                      role="list"
                                      aria-label={
                                        `Capítulos de ${
                                          hasSingleSubjectDocument
                                            ? selectedSubject.title
                                            : selectedDocument
                                              ? documentDisplayName(
                                                selectedDocument,
                                              )
                                              : selectedSubject.title
                                        }`
                                      }
                                    >
                                      {selectedDocumentChapters.map(
                                        (chapter) => {
                                          const chapterKey = String(
                                            chapter._id
                                            || chapter.ChapterNumber
                                            || chapter.ChapterTitle,
                                          )
                                          const isChapterActive = (
                                            isChapterBubbleActive(
                                              id,
                                              chapter,
                                              selectedSubject._id,
                                            )
                                          )
                                          return (
                                            <button
                                              key={chapterKey}
                                              type="button"
                                              role="listitem"
                                              className={
                                                'home-hub__subject-bubble ' +
                                                'home-hub__subject-bubble--chapter' +
                                                (isChapterActive
                                                  ? ' home-hub__subject-bubble--active'
                                                  : '')
                                              }
                                              onClick={() => (
                                                handleChapterBubbleClick(
                                                  chapter,
                                                  selectedSubject._id,
                                                )
                                              )}
                                              aria-pressed={isChapterActive}
                                            >
                                              <span
                                                className={
                                                  'home-hub__subject-bubble-dot'
                                                }
                                                aria-hidden
                                              />
                                              {chapter.ChapterTitle}
                                            </button>
                                          )
                                        },
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <p
                                    className={
                                      'home-hub__chapters-empty animate-fade-in'
                                    }
                                  >
                                    Este documento aún no tiene capítulos
                                    disponibles.
                                  </p>
                                )
                              ) : selectedSubjectDocuments.length > 0 ? (
                                <div
                                  className={
                                    'home-hub__chapters ' +
                                    'home-hub__chapters--solo animate-fade-in'
                                  }
                                >
                                  <p className="home-hub__chapters-label">
                                    Documentos de {selectedSubject.title}
                                  </p>
                                  <div
                                    className="home-hub__subjects-list"
                                    role="list"
                                    aria-label={
                                      `Documentos de ${selectedSubject.title}`
                                    }
                                  >
                                    {selectedSubjectDocuments.map((doc) => {
                                      const docKey = getDocumentKey(doc)
                                      const chapterCount = getDocumentChapters(
                                        selectedSubject,
                                        docKey,
                                        mySubjectsById,
                                      ).length
                                      return (
                                        <button
                                          key={docKey}
                                          type="button"
                                          role="listitem"
                                          className={
                                            'home-hub__subject-bubble ' +
                                            'home-hub__subject-bubble--document'
                                          }
                                          onClick={() => handleDocumentBubbleClick(
                                            doc,
                                          )}
                                        >
                                          <span
                                            className={
                                              'home-hub__subject-bubble-dot'
                                            }
                                            aria-hidden
                                          />
                                          <span
                                            className={
                                              'home-hub__document-bubble-text'
                                            }
                                          >
                                            {documentDisplayName(doc)}
                                          </span>
                                          {chapterCount > 0 ? (
                                            <span
                                              className={
                                                'home-hub__document-bubble-count'
                                              }
                                              aria-label={
                                                `${chapterCount} capítulos`
                                              }
                                            >
                                              {chapterCount}
                                            </span>
                                          ) : null}
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <p
                                  className={
                                    'home-hub__chapters-empty animate-fade-in'
                                  }
                                >
                                  Esta materia aún no tiene documentos
                                  disponibles.
                                </p>
                              )}
                            </>
                          ) : (
                            <div
                              className="home-hub__subjects-list"
                              role="list"
                              aria-label="Tus materias"
                            >
                              {subscribedSubjects.map((subject) => {
                                const subjectId = String(subject._id)
                                return (
                                  <button
                                    key={subjectId}
                                    type="button"
                                    role="listitem"
                                    className="home-hub__subject-bubble"
                                    onClick={() => handleSubjectBubbleClick(
                                      subject,
                                    )}
                                  >
                                    <span
                                      className="home-hub__subject-bubble-dot"
                                      aria-hidden
                                    />
                                    {subject.title}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="home-hub__subjects-empty">
                          Tus materias aparecerán aquí cuando te inscribas
                          en un plan.
                        </p>
                      )}
                    </div>
                    {canUseAiTutor
                      && showSubheading
                      && !showQuestions
                      && !isExamRoute
                      && subscribedSubjects.length === 0 && (
                      <button
                        type="button"
                        className="home-hub__prompt animate-fade-in"
                        onClick={() => setShowQuestions(true)}
                      >
                        {predefinedQuestion}
                      </button>
                    )}
                    {canUseAiTutor && showQuestions && !isExamRoute ? (
                      <div className="home-suggested animate-fade-in">
                        <p className="home-suggested__label">
                          Preguntas sugeridas
                        </p>
                        <p className="home-hub__questions-empty">
                          Selecciona una materia, un documento y un capítulo
                          para ver preguntas sugeridas.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="chat-messages chat-messages--home">
                <button
                  type="button"
                  className="chat-messages__back-btn"
                  onClick={handleBackFromChat}
                  aria-label="Volver a preguntas sugeridas"
                >
                  ← Volver
                </button>
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={message.type === 'question' ? 'message-question' : 'message-answer'}
                  >
                    <div className="message-wrapper">
                      <div className="message-content">
                        {message.type === 'answer' ? (
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code: ({node, inline, className, children, ...props}) => {
                                return inline ? (
                                  <code className="inline-code" {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <code className="code-block" {...props}>
                                    {children}
                                  </code>
                                );
                              }
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          message.content
                        )}
                      </div>
                      <button 
                        className="voice-button"
                        onClick={() => playAudio(message.content, index)}
                        aria-label={
                          loadingAudio === index
                            ? 'Cargando audio'
                            : playingAudio === index
                              ? 'Detener audio'
                              : 'Reproducir audio'
                        }
                        title={
                          loadingAudio === index
                            ? 'Cargando audio...'
                            : playingAudio === index
                              ? 'Detener audio'
                              : 'Reproducir audio'
                        }
                        disabled={
                          !canUseAiTutor
                          || (loadingAudio !== null && loadingAudio !== index)
                        }
                      >
                        {loadingAudio === index ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="audio-loading-spinner">
                            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                          </svg>
                        ) : playingAudio === index ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message-answer">
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="input-area input-area--home">
            <form
              className="input-container input-container--home"
              onSubmit={submitHandler}
            >
              <input
                type="text"
                className="input-field"
                name="home-chat-message"
                placeholder={
                  !canUseAiTutor
                    ? 'Suscríbete para usar el tutor de IA'
                    : effectivePineconeIndexId
                      ? 'Pregunta lo que quieras…'
                      : selectedDocumentId
                        || hasSingleSubjectDocument
                        ? 'Selecciona un capítulo para preguntar'
                        : selectedSubjectId
                          ? 'Selecciona un documento para continuar'
                          : 'Selecciona una materia para empezar'
                }
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                aria-label="Tu pregunta"
                disabled={inputDisabled}
              />
              <button
                type="submit"
                className="send-button send-button--home"
                disabled={inputDisabled || !question.trim()}
                aria-label="Enviar mensaje"
              >
                <SendButtonIcon />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;
