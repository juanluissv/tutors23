const API_MESSAGES_ES = {
	'Could not load the chapter PDF from storage.':
		'No se pudo cargar el PDF del capítulo.',
	'Subject not found': 'No se encontró la materia.',
	'Not authorized to view this lesson':
		'No tienes permiso para ver esta lección.',
	'Invalid subject id': 'El id de la materia no es válido.',
	'Not authorized to view this book':
		'No tienes permiso para ver este libro.',
	'Invalid lesson id': 'El id de la lección no es válido.',
	'Lesson not found': 'No se encontró la lección.',
	'Invalid chapter id': 'El id del capítulo no es válido.',
	'Chapter not found': 'No se encontró el capítulo.',
	'The web lesson has no content to extract.':
		'La lección web no tiene contenido para extraer.',
	'Failed to create Pinecone index for this chapter.':
		'No se pudo crear el índice de este capítulo.',
	'Failed to upload the lesson text file to storage.':
		'No se pudo subir el archivo de texto de la lección.',
	'Failed to ingest lesson text into Pinecone.':
		'No se pudo guardar el texto de la lección en el índice.',
	'No suggested questions were generated.':
		'No se generaron preguntas sugeridas.',
	'No video script scenes were generated.':
		'No se generaron escenas del guion de video.',
	'No audio was generated from the video script.':
		'No se generó audio a partir del guion de video.',
	'Failed to upload the video narration audio to storage.':
		'No se pudo subir el audio de narración.',
	'Video script has no scenes to illustrate.':
		'El guion de video no tiene escenas para ilustrar.',
	'Could not build video render script.':
		'No se pudo armar el guion de generación de video.',
	'Creatomate could not start the video render.':
		'Creatomate no pudo iniciar la generación del video.',
	'This chapter has no web lesson yet. Generate the web lesson first.':
		'Este capítulo aún no tiene lección web. Primero genera la lección web.',
	'No Creatomate render is in progress for this chapter. Generate a Creatomate video first.':
		'No hay una generación de Creatomate en curso para este capítulo. Primero genera un video de Creatomate.',
	'Could not check Creatomate render status.':
		'No se pudo revisar el estado de la generación en Creatomate.',
	'Creatomate render failed': 'La generación de Creatomate falló.',
	'Could not download the video from Creatomate.':
		'No se pudo descargar el video de Creatomate.',
	'Creatomate returned an empty video file.':
		'Creatomate devolvió un archivo de video vacío.',
	'Video is ready and added to the lesson.':
		'El video está listo y se añadió a la lección.',
	'Failed to upload the rendered video to storage.':
		'No se pudo subir el video generado.',
	'Video file is required': 'Se requiere un archivo de video.',
	'Failed to upload the tutor video to storage.':
		'No se pudo subir el video del tutor.',
	'Invalid suggested question index':
		'El índice de la pregunta sugerida no es válido.',
	'Subtitle file (.srt) is required':
		'Se requiere un archivo de subtítulos (.srt).',
	'Failed to upload the tutor captions to storage.':
		'No se pudieron subir los subtítulos del tutor.',
	'Could not load the transcript from storage.':
		'No se pudo cargar la transcripción.',
	'This lesson has no transcript.':
		'Esta lección no tiene transcripción.',
	'Teacher not found': 'No se encontró al profesor.',
	'Email already in use': 'Ese correo ya está en uso.',
	'Invalid email or password': 'Correo o contraseña no válidos.',
	'Email is required': 'El correo es obligatorio.',
	'Password is required': 'La contraseña es obligatoria.',
	'Invalid email address': 'El correo no es válido.',
	'Invalid teacher email': 'El correo del profesor no es válido.',
	'Invalid student email address':
		'El correo del estudiante no es válido.',
	'Student email is required': 'El correo del estudiante es obligatorio.',
	'Teacher email is required': 'El correo del profesor es obligatorio.',
	'Not authorized': 'No autorizado.',
	'Not authorized, token failed': 'No autorizado. La sesión no es válida.',
	'Not authorized, no token': 'No autorizado. Inicia sesión de nuevo.',
	'Invalid question id': 'El id de la pregunta no es válido.',
	'Question not found': 'No se encontró la pregunta.',
	'Not authorized to update this question':
		'No tienes permiso para actualizar esta pregunta.',
	'Not authorized to view this question':
		'No tienes permiso para ver esta pregunta.',
	'Not authorized to view this video':
		'No tienes permiso para ver este video.',
	'No video for this question': 'Esta pregunta no tiene video.',
	'Invalid teacher id': 'El id del profesor no es válido.',
	'Not authorized to view questions for this teacher':
		'No tienes permiso para ver las preguntas de este profesor.',
	'Title is required': 'El título es obligatorio.',
	'A valid subject is required': 'Se requiere una materia válida.',
	'You are not enrolled in this subject':
		'No estás inscrito en esta materia.',
	'This subject has no teacher assigned yet':
		'Esta materia aún no tiene un profesor asignado.',
	'Invalid answer id': 'El id de la respuesta no es válido.',
	'Answer not found': 'No se encontró la respuesta.',
	'Not authorized to answer this question':
		'No tienes permiso para responder esta pregunta.',
	'Not authorized to update this answer':
		'No tienes permiso para actualizar esta respuesta.',
	'Not authorized to view this answer':
		'No tienes permiso para ver esta respuesta.',
	'Description is required': 'La descripción es obligatoria.',
	'Question has no title': 'La pregunta no tiene título.',
	'Failed to upload the video to storage.':
		'No se pudo subir el video.',
	'No video for this answer': 'Esta respuesta no tiene video.',
	'Could not load the source document from storage.':
		'No se pudo cargar el documento fuente.',
	'Failed to save the chapter PDF to storage.':
		'No se pudo guardar el PDF del capítulo.',
	'No PDF file uploaded': 'No se subió ningún archivo PDF.',
	'Failed to upload the chapter PDF to storage.':
		'No se pudo subir el PDF del capítulo.',
	'Invalid document id': 'El id del documento no es válido.',
	'Document not found': 'No se encontró el documento.',
	'PDF file is required': 'Se requiere un archivo PDF.',
	'No book uploaded for this subject':
		'Esta materia no tiene un libro subido.',
	'Not authorized to open this book':
		'No tienes permiso para abrir este libro.',
	'Not authorized to update this subject':
		'No tienes permiso para actualizar esta materia.',
	'Subject title is required': 'El nombre de la materia es obligatorio.',
	'Subject title cannot be empty':
		'El nombre de la materia no puede estar vacío.',
	'bookChapters must be an array':
		'La lista de capítulos no es válida.',
}

function looksLikeEnglishApiMessage (text) {
	const value = String(text || '').trim()
	if (!value) {
		return false
	}
	if (/[áéíóúñ¿¡]/i.test(value)) {
		return false
	}
	return /\b(the|this|that|could not|failed|invalid|not found|required|please|check|render|chapter|lesson|video|subject|storage|authorized|password|email)\b/i.test(
		value,
	)
}

export function localizeApiMessage (message, fallback) {
	const raw = String(message || '').trim()
	if (!raw) {
		return fallback
	}
	if (API_MESSAGES_ES[raw]) {
		return API_MESSAGES_ES[raw]
	}
	const lower = raw.toLowerCase()
	if (lower.includes('added to the lesson')) {
		return 'El video está listo y se añadió a la lección.'
	}
	if (lower.includes('creatomate render started')) {
		return 'La generación de Creatomate comenzó. Usa Revisar estado del video cuando esté listo.'
	}
	if (lower.includes('still processing on creatomate')) {
		return 'El video aún se está procesando en Creatomate. Revisa de nuevo en unos minutos.'
	}
	if (lower.includes('has not finished this render')) {
		return 'Creatomate aún no termina esta generación. Revisa de nuevo en un momento.'
	}
	if (looksLikeEnglishApiMessage(raw)) {
		return fallback
	}
	return raw
}

export function localizeApiError (err, fallback) {
	return localizeApiMessage(
		err?.data?.message || err?.error?.message || err?.error || err?.message,
		fallback,
	)
}
