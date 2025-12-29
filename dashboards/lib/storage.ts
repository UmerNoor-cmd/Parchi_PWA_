import { supabase } from './supabase'

export class SupabaseStorageService {
  private static BUCKET_NAME = 'merchant-assets'

  /**
   * Upload offer image to Supabase Storage
   * Returns the public URL of the uploaded image
   */
  static async uploadOfferImage(file: File, offerTitle: string): Promise<string> {
    try {
      // Create a clean filename from offer title
      const cleanName = offerTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')
      const timestamp = Date.now()
      const extension = file.name.split('.').pop()
      const filePath = `offers/${cleanName}-${timestamp}.${extension}`

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (e) {
      console.error('Failed to upload offer image:', e)
      throw new Error('Failed to upload offer image')
    }
  }

  /**
   * Upload corporate logo to Supabase Storage
   * Returns the public URL of the uploaded image
   */
  static async uploadCorporateLogo(file: File, businessName: string): Promise<string> {
    try {
      // Create a clean filename from business name
      const cleanName = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')
      const timestamp = Date.now()
      const extension = file.name.split('.').pop()
      const filePath = `logos/${cleanName}-${timestamp}.${extension}`

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (e) {
      console.error('Failed to upload logo:', e)
      throw new Error('Failed to upload logo image')
    }
  }
}
