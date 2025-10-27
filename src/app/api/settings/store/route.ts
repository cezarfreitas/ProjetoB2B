import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'

// Configurar cache de 5 minutos para a rota
export const revalidate = 300 // 5 minutos em segundos

// GET - Buscar configurações da loja
export async function GET() {
  try {
    // Buscar ou criar configurações padrão
    let settings = await prisma.storeSettings.findFirst()
    
    if (!settings) {
      // Criar configurações padrão se não existir
      settings = await prisma.storeSettings.create({
        data: {
          storeName: 'B2B Tropical',
          logoUrl: '',
          description: '',
          contactPhone: '',
          address: '',
          cnpj: '',
          email: '',
          detailedAddress: '',
          street: '',
          number: '',
          complement: '',
          zipCode: '',
          neighborhood: '',
          city: '',
          state: '',
          facebook: '',
          instagram: '',
          tiktok: '',
          googleBusiness: '',
          youtube: '',
          linkedin: '',
          website: '',
          publicAccessMode: 'OPEN'
        }
      })
    }

    return NextResponse.json({
      storeName: settings.storeName,
      logoUrl: settings.logoUrl || '',
      description: settings.description || '',
      contactPhone: settings.contactPhone || '',
      address: settings.address || '',
      cnpj: settings.cnpj || '',
      email: settings.email || '',
      detailedAddress: settings.detailedAddress || '',
      street: settings.street || '',
      number: settings.number || '',
      complement: settings.complement || '',
      zipCode: settings.zipCode || '',
      neighborhood: settings.neighborhood || '',
      city: settings.city || '',
      state: settings.state || '',
      facebook: settings.facebook || '',
      instagram: settings.instagram || '',
      tiktok: settings.tiktok || '',
      googleBusiness: settings.googleBusiness || '',
      youtube: settings.youtube || '',
      linkedin: settings.linkedin || '',
      website: settings.website || '',
      publicAccessMode: settings.publicAccessMode || 'OPEN'
    })
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    )
  }
}

// POST - Salvar configurações da loja
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { storeName, logoUrl, description, contactPhone, address, cnpj, email, detailedAddress, street, number, complement, zipCode, neighborhood, city, state, facebook, instagram, tiktok, googleBusiness, youtube, linkedin, website, publicAccessMode } = body

    console.log('Dados recebidos na API:', { storeName, logoUrl, description, contactPhone, address, cnpj, email, detailedAddress, street, number, complement, zipCode, neighborhood, city, state, facebook, instagram, tiktok, googleBusiness, youtube, linkedin, website, publicAccessMode })

    // Validação
    if (!storeName || storeName.trim() === '') {
      return NextResponse.json(
        { error: 'Nome da loja é obrigatório' },
        { status: 400 }
      )
    }

    // Converter publicAccessMode para UPPERCASE para corresponder ao enum do banco
    const publicAccessModeUpper = publicAccessMode?.toUpperCase() || 'OPEN'

    // Buscar configuração existente
    const existingSettings = await prisma.storeSettings.findFirst()

    let settings
    if (existingSettings) {
      // Atualizar configurações existentes
      settings = await prisma.storeSettings.update({
        where: { id: existingSettings.id },
        data: {
          storeName: storeName.trim(),
          logoUrl: logoUrl?.trim() || null,
          description: description?.trim() || null,
          contactPhone: contactPhone?.trim() || null,
          address: address?.trim() || null,
          cnpj: cnpj?.trim() || null,
          email: email?.trim() || null,
          detailedAddress: detailedAddress?.trim() || null,
          street: street?.trim() || null,
          number: number?.trim() || null,
          complement: complement?.trim() || null,
          zipCode: zipCode?.trim() || null,
          neighborhood: neighborhood?.trim() || null,
          city: city?.trim() || null,
          state: state?.trim() || null,
          facebook: facebook?.trim() || null,
          instagram: instagram?.trim() || null,
          tiktok: tiktok?.trim() || null,
          googleBusiness: googleBusiness?.trim() || null,
          youtube: youtube?.trim() || null,
          linkedin: linkedin?.trim() || null,
          website: website?.trim() || null,
          publicAccessMode: publicAccessModeUpper as 'CLOSED' | 'PARTIAL' | 'OPEN'
        }
      })
      console.log('Configurações atualizadas no banco:', settings)
    } else {
      // Criar novas configurações
      settings = await prisma.storeSettings.create({
        data: {
          storeName: storeName.trim(),
          logoUrl: logoUrl?.trim() || null,
          description: description?.trim() || null,
          contactPhone: contactPhone?.trim() || null,
          address: address?.trim() || null,
          cnpj: cnpj?.trim() || null,
          email: email?.trim() || null,
          detailedAddress: detailedAddress?.trim() || null,
          street: street?.trim() || null,
          number: number?.trim() || null,
          complement: complement?.trim() || null,
          zipCode: zipCode?.trim() || null,
          neighborhood: neighborhood?.trim() || null,
          city: city?.trim() || null,
          state: state?.trim() || null,
          facebook: facebook?.trim() || null,
          instagram: instagram?.trim() || null,
          tiktok: tiktok?.trim() || null,
          googleBusiness: googleBusiness?.trim() || null,
          youtube: youtube?.trim() || null,
          linkedin: linkedin?.trim() || null,
          website: website?.trim() || null,
          publicAccessMode: publicAccessModeUpper as 'CLOSED' | 'PARTIAL' | 'OPEN'
        }
      })
      console.log('Configurações criadas no banco:', settings)
    }

    // Invalidar cache da rota para forçar nova busca
    revalidatePath('/api/settings/store')
    revalidatePath('/', 'layout') // Invalida todas as páginas que usam o footer

    return NextResponse.json({
      message: 'Configurações salvas com sucesso',
      settings: {
        storeName: settings.storeName,
        logoUrl: settings.logoUrl || '',
        description: settings.description || '',
        contactPhone: settings.contactPhone || '',
        address: settings.address || '',
        cnpj: settings.cnpj || '',
        email: settings.email || '',
        detailedAddress: settings.detailedAddress || '',
        street: settings.street || '',
        number: settings.number || '',
        complement: settings.complement || '',
        zipCode: settings.zipCode || '',
        neighborhood: settings.neighborhood || '',
        city: settings.city || '',
        state: settings.state || '',
        facebook: settings.facebook || '',
        instagram: settings.instagram || '',
        tiktok: settings.tiktok || '',
        googleBusiness: settings.googleBusiness || '',
        youtube: settings.youtube || '',
        linkedin: settings.linkedin || '',
        website: settings.website || '',
        publicAccessMode: settings.publicAccessMode || 'OPEN'
      }
    })
  } catch (error) {
    console.error('Erro ao salvar configurações:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao salvar configurações'
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    )
  }
}

