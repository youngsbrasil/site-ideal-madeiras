export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          active: boolean
          created_at: string
          end_at: string | null
          id: string
          image_url: string
          link_url: string | null
          sort_order: number
          start_at: string | null
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          end_at?: string | null
          id?: string
          image_url: string
          link_url?: string | null
          sort_order?: number
          start_at?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          end_at?: string | null
          id?: string
          image_url?: string
          link_url?: string | null
          sort_order?: number
          start_at?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          canonical: string | null
          created_at: string
          id: string
          image_url: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          noindex: boolean | null
          og_image: string | null
          parent_id: string | null
          product_count: number
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          canonical?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          noindex?: boolean | null
          og_image?: string | null
          parent_id?: string | null
          product_count?: number
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          canonical?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          noindex?: boolean | null
          og_image?: string | null
          parent_id?: string | null
          product_count?: number
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          ativo: boolean
          categorias_aplicaveis: string[]
          codigo: string
          created_at: string
          descricao: string | null
          destacar_no_site: boolean
          id: string
          tipo: string
          updated_at: string
          uso_maximo: number | null
          usos_atuais: number
          validade_fim: string | null
          validade_inicio: string | null
          valor: number
          valor_minimo_pedido: number | null
        }
        Insert: {
          ativo?: boolean
          categorias_aplicaveis?: string[]
          codigo: string
          created_at?: string
          descricao?: string | null
          destacar_no_site?: boolean
          id?: string
          tipo: string
          updated_at?: string
          uso_maximo?: number | null
          usos_atuais?: number
          validade_fim?: string | null
          validade_inicio?: string | null
          valor: number
          valor_minimo_pedido?: number | null
        }
        Update: {
          ativo?: boolean
          categorias_aplicaveis?: string[]
          codigo?: string
          created_at?: string
          descricao?: string | null
          destacar_no_site?: boolean
          id?: string
          tipo?: string
          updated_at?: string
          uso_maximo?: number | null
          usos_atuais?: number
          validade_fim?: string | null
          validade_inicio?: string | null
          valor?: number
          valor_minimo_pedido?: number | null
        }
        Relationships: []
      }
      hotspots: {
        Row: {
          active: boolean
          created_at: string
          id: string
          image_key: string
          label: string | null
          product_id: string | null
          sort_order: number
          updated_at: string
          x: number
          y: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          image_key: string
          label?: string | null
          product_id?: string | null
          sort_order?: number
          updated_at?: string
          x?: number
          y?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          image_key?: string
          label?: string | null
          product_id?: string | null
          sort_order?: number
          updated_at?: string
          x?: number
          y?: number
        }
        Relationships: [
          {
            foreignKeyName: "hotspots_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt: string
          created_at: string
          id: string
          ordem: number
          product_id: string
          updated_at: string
          url: string
        }
        Insert: {
          alt: string
          created_at?: string
          id?: string
          ordem?: number
          product_id: string
          updated_at?: string
          url: string
        }
        Update: {
          alt?: string
          created_at?: string
          id?: string
          ordem?: number
          product_id?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      product_related: {
        Row: {
          created_at: string
          id: string
          ordem: number
          product_id: string
          related_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ordem?: number
          product_id: string
          related_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ordem?: number
          product_id?: string
          related_id?: string
        }
        Relationships: []
      }
      product_variations: {
        Row: {
          atributo: string
          created_at: string
          disponivel: boolean
          id: string
          ordem: number
          product_id: string
          sku: string | null
          updated_at: string
          valor: string
        }
        Insert: {
          atributo: string
          created_at?: string
          disponivel?: boolean
          id?: string
          ordem?: number
          product_id: string
          sku?: string | null
          updated_at?: string
          valor: string
        }
        Update: {
          atributo?: string
          created_at?: string
          disponivel?: boolean
          id?: string
          ordem?: number
          product_id?: string
          sku?: string | null
          updated_at?: string
          valor?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          availability: string | null
          canonical: string | null
          category_id: string | null
          created_at: string
          description: string | null
          featured: boolean
          finishes: string[]
          gallery: Json
          id: string
          main_image: string | null
          meta_description: string | null
          meta_title: string | null
          most_viewed: boolean
          name: string
          noindex: boolean | null
          og_image: string | null
          old_price: string | null
          price: string
          price_value: number | null
          sizes: string[]
          slug: string
          sort_order: number
          specifications: Json
          types: string[]
          updated_at: string
          woods: string[]
        }
        Insert: {
          active?: boolean
          availability?: string | null
          canonical?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          finishes?: string[]
          gallery?: Json
          id?: string
          main_image?: string | null
          meta_description?: string | null
          meta_title?: string | null
          most_viewed?: boolean
          name: string
          noindex?: boolean | null
          og_image?: string | null
          old_price?: string | null
          price: string
          price_value?: number | null
          sizes?: string[]
          slug: string
          sort_order?: number
          specifications?: Json
          types?: string[]
          updated_at?: string
          woods?: string[]
        }
        Update: {
          active?: boolean
          availability?: string | null
          canonical?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          finishes?: string[]
          gallery?: Json
          id?: string
          main_image?: string | null
          meta_description?: string | null
          meta_title?: string | null
          most_viewed?: boolean
          name?: string
          noindex?: boolean | null
          og_image?: string | null
          old_price?: string | null
          price?: string
          price_value?: number | null
          sizes?: string[]
          slug?: string
          sort_order?: number
          specifications?: Json
          types?: string[]
          updated_at?: string
          woods?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      redirects: {
        Row: {
          ativo: boolean
          created_at: string
          hits: number
          id: string
          tipo: number
          updated_at: string
          url_destino: string
          url_origem: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          hits?: number
          id?: string
          tipo?: number
          updated_at?: string
          url_destino: string
          url_origem: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          hits?: number
          id?: string
          tipo?: number
          updated_at?: string
          url_destino?: string
          url_origem?: string
        }
        Relationships: []
      }
      review_widgets: {
        Row: {
          active: boolean
          created_at: string
          id: string
          layout: string
          max_items: number
          min_rating: number
          scope: string
          scope_ref: string | null
          show_average: boolean
          show_cta_badge: boolean
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          layout?: string
          max_items?: number
          min_rating?: number
          scope: string
          scope_ref?: string | null
          show_average?: boolean
          show_cta_badge?: boolean
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          layout?: string
          max_items?: number
          min_rating?: number
          scope?: string
          scope_ref?: string | null
          show_average?: boolean
          show_cta_badge?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_avatar_url: string | null
          author_name: string
          content: string | null
          created_at: string
          external_id: string | null
          featured: boolean
          hidden: boolean
          id: string
          language: string | null
          rating: number
          reply: string | null
          review_date: string | null
          sort_order: number
          source: string
          synced_at: string | null
          updated_at: string
        }
        Insert: {
          author_avatar_url?: string | null
          author_name: string
          content?: string | null
          created_at?: string
          external_id?: string | null
          featured?: boolean
          hidden?: boolean
          id?: string
          language?: string | null
          rating: number
          reply?: string | null
          review_date?: string | null
          sort_order?: number
          source?: string
          synced_at?: string | null
          updated_at?: string
        }
        Update: {
          author_avatar_url?: string | null
          author_name?: string
          content?: string | null
          created_at?: string
          external_id?: string | null
          featured?: boolean
          hidden?: boolean
          id?: string
          language?: string | null
          rating?: number
          reply?: string | null
          review_date?: string | null
          sort_order?: number
          source?: string
          synced_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      search_log: {
        Row: {
          clicked_product_id: string | null
          created_at: string
          id: string
          results_count: number
          term: string
          term_normalized: string
          user_id: string | null
        }
        Insert: {
          clicked_product_id?: string | null
          created_at?: string
          id?: string
          results_count?: number
          term: string
          term_normalized: string
          user_id?: string | null
        }
        Update: {
          clicked_product_id?: string | null
          created_at?: string
          id?: string
          results_count?: number
          term?: string
          term_normalized?: string
          user_id?: string | null
        }
        Relationships: []
      }
      shoppable_pins: {
        Row: {
          created_at: string
          id: string
          label: string | null
          product_id: string | null
          scene_id: string
          x: number
          y: number
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          product_id?: string | null
          scene_id: string
          x: number
          y: number
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          product_id?: string | null
          scene_id?: string
          x?: number
          y?: number
        }
        Relationships: [
          {
            foreignKeyName: "shoppable_pins_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shoppable_pins_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "shoppable_scenes"
            referencedColumns: ["id"]
          },
        ]
      }
      shoppable_scenes: {
        Row: {
          active: boolean
          created_at: string
          id: string
          image_url: string
          sort_order: number
          title: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
          title?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
          title?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          trustindex_api_key: string | null
          trustindex_widget_id: string | null
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          trustindex_api_key?: string | null
          trustindex_widget_id?: string | null
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          trustindex_api_key?: string | null
          trustindex_widget_id?: string | null
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "user" | "catalogo" | "marketing"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "catalogo", "marketing"],
    },
  },
} as const
