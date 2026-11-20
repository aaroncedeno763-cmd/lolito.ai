const segmentationSchema = {
  type: 'object',

  properties: {
    join_previous: {
      type: 'boolean'
    },

    joined_title: {
      type: 'string'
    },

    joined_keywords: {
      type: 'array',
      items: {
        type: 'string'
      }
    },

    segments: {
      type: 'array',

      items: {
        type: 'object',

        properties: {
          start_id: {
            type: 'string'
          },

          end_id: {
            type: 'string'
          },

          title: {
            type: 'string'
          },

          category: {
            type: 'string',

            enum: [
              'content',
              'table',
              'metadata',
              'boilerplate',
              'other'
            ]
          },

          keywords: {
            type: 'array',

            items: {
              type: 'string'
            }
          }
        },

        required: [
          'start_id',
          'end_id',
          'title',
          'category',
          'keywords'
        ],

        additionalProperties: false
      }
    }
  },

  required: [
    'join_previous',
    'joined_title',
    'joined_keywords',
    'segments'
  ],

  additionalProperties: false
}

const answerGenerationSchema = {
  type: 'object',
  properties: {
    answer: {
      type: 'string',
      description: 'Answer to the user question, grounded in retrieved documents.'
    },
    status: {
      type: 'string',
      enum: ['answered', 'partial', 'insufficient_information'],
      description: 'Indicates whether the retrieved information fully or partially answers the question.'
    },
    sources: {
      type: 'array',
      description: 'Document passages supporting the answer.',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Original document identifier.'
          },
          filename: {
            type: ['string', 'null'],
            description: 'Exact original filename obtained from metadata.'
          },
          filepath: {
            type: ['string', 'null'],
            description: 'Exact original path obtained from metadata.'
          },
          page: {
            type: ['integer', 'null'],
            description: 'Page number containing the relevant passage.'
          },
          excerpt: {
            type: ['string', 'null'],
            description: 'Exact relevant passage from the original document, without paraphrasing or modification.'
          }
        },
        required: ['id', 'filename', 'filepath', 'page', 'excerpt'],
        additionalProperties: false
      }
    }
  },
  required: ['answer', 'status', 'sources'],
  additionalProperties: false
}

const pdfReadingSchema = {
  type: 'object',
  properties: {
    blocks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          type: {
            type: 'string',
            enum: ['heading', 'paragraph', 'table', 'list', 'other']
          },
          text: { type: 'string' }
        },
        required: ['page', 'type', 'text'],
        additionalProperties: false
      }
    }
  },
  required: ['blocks'],
  additionalProperties: false
}

module.exports = { segmentationSchema, answerGenerationSchema, pdfReadingSchema }