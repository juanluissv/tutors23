const BLOCK_ID_RE = /^b\d+$/
const HERO_BLOCK_ID_RE = /^h\d+$/

const HERO_BLOCK_IDS = {
	mainTitle: 'h0',
	unitTheme: 'h1',
	heroSubtitle: 'h2',
	objectivesText: 'h3',
}

function toPlainBlock (block) {
	if (!block || typeof block !== 'object') {
		return block
	}

	if (typeof block.toObject === 'function') {
		return block.toObject()
	}

	return block
}

function assignBlockIds (content) {
	if (!Array.isArray(content)) {
		return []
	}

	return content.map((block, index) => {
		if (!block || typeof block !== 'object') {
			return block
		}

		const plain = toPlainBlock(block)
		const existingId = plain.blockId != null
			? String(plain.blockId).trim()
			: ''
		const blockId = BLOCK_ID_RE.test(existingId)
			? existingId
			: `b${index}`

		return {
			...plain,
			blockId,
		}
	})
}

function isBlockId (value) {
	const id = String(value || '').trim()
	return BLOCK_ID_RE.test(id) || HERO_BLOCK_ID_RE.test(id)
}

function blockIdOrder (blockId) {
	const match = String(blockId || '').trim().match(/^b(\d+)$/)
	return match ? Number(match[1]) : -1
}

export {
	assignBlockIds,
	isBlockId,
	blockIdOrder,
	toPlainBlock,
	BLOCK_ID_RE,
	HERO_BLOCK_ID_RE,
	HERO_BLOCK_IDS,
}
