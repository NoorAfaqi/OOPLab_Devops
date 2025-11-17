import { google, sheets_v4 } from 'googleapis';

// Google Sheets API integration for CMS
export class GoogleSheetsCMS {
  private sheets: sheets_v4.Sheets;
  private spreadsheetId: string;

  constructor(spreadsheetId: string, apiKey: string) {
    this.spreadsheetId = spreadsheetId;
    this.sheets = google.sheets({ version: 'v4', auth: apiKey });
  }

  async getArticles() {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Articles!A2:H', // Assuming headers are in row 1
      });

      const rows = response.data.values || [];
      
      return rows.map((row: string[], index: number) => ({
        id: row[0] || `article-${index}`,
        title: row[1] || '',
        excerpt: row[2] || '',
        content: row[3] || '',
        author: row[4] || '',
        publishedAt: row[5] || new Date().toISOString(),
        category: row[6] || 'General',
        readTime: parseInt(row[7]) || 5,
        imageUrl: row[8] || '/api/placeholder/600/300'
      }));
    } catch (error) {
      console.error('Error fetching articles from Google Sheets:', error);
      throw error;
    }
  }

  async addArticle(article: Record<string, unknown>) {
    try {
      const values = [
        [
          Date.now().toString(), // ID
          article.title,
          article.excerpt,
          article.content,
          article.author,
          new Date().toISOString(),
          article.category,
          article.readTime || 5,
          article.imageUrl || '/api/placeholder/600/300'
        ]
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Articles!A:H',
        valueInputOption: 'RAW',
        requestBody: {
          values
        }
      });

      return { success: true, message: 'Article added successfully' };
    } catch (error) {
      console.error('Error adding article to Google Sheets:', error);
      throw error;
    }
  }

  async updateArticle(id: string, article: Record<string, unknown>) {
    try {
      // First, find the row with the matching ID
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Articles!A:A',
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex((row: string[]) => row[0] === id);

      if (rowIndex === -1) {
        throw new Error('Article not found');
      }

      const values = [
        [
          id,
          article.title,
          article.excerpt,
          article.content,
          article.author,
          article.publishedAt,
          article.category,
          article.readTime,
          article.imageUrl
        ]
      ];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `Articles!A${rowIndex + 1}:H${rowIndex + 1}`,
        valueInputOption: 'RAW',
        requestBody: {
          values
        }
      });

      return { success: true, message: 'Article updated successfully' };
    } catch (error) {
      console.error('Error updating article in Google Sheets:', error);
      throw error;
    }
  }
}

// Usage example in API routes
export async function getArticlesFromSheets() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

  if (!spreadsheetId || !apiKey) {
    throw new Error('Google Sheets configuration missing');
  }

  const cms = new GoogleSheetsCMS(spreadsheetId, apiKey);
  return await cms.getArticles();
}
