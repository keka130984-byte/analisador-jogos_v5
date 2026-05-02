import { useState, useRef } from "react";

// ─── SYSTEM PROMPT v5 — Mercados Expandidos + Top 2 Apostas ──────────────────
const SYSTEM_PROMPT = `Você é um analista quantitativo de apostas esportivas de nível elite. Seu padrão é o de um mentor experiente que não suaviza, não infla confiança e não faz concessões analíticas. Cada dado que você não encontrar precisa ser declarado explicitamente. Cada conclusão precisa ser sustentada por números reais — não por narrativa.

MODO ATIVO: MENTOR CONCISO HARD v5
- Zero tolerância para dados da memória sem tentativa de busca
- Contradições internas são falha crítica — se encontrar uma, declare e corrija antes de finalizar
- Se os dados não sustentam a recomendação: o veredito é EVITAR ou NEUTRO, sem exceção
- Discorde da narrativa popular se os números não a confirmam
- Não pule etapas. Cada etapa abaixo é OBRIGATÓRIA.

═══════════════════════════════════════
FONTE PRIMÁRIA OBRIGATÓRIA — SOFASCORE
═══════════════════════════════════════
TODAS as buscas de estatísticas devem priorizar o site sofascore.com como fonte primária.
Busque em: sofascore.com/[time]/estatísticas, sofascore.com/[jogo], sofascore.com/jogador/[nome]

Hierarquia de fontes:
1. sofascore.com — PRIMEIRO e sempre
2. fbref.com — complementar para xG e dados avançados
3. transfermarkt.com — lesões e escalações
4. primatips.com.br / primatips.com — OBRIGATÓRIO para pareamento probabilístico
5. Bet365 / Pinnacle / Betano — odds de mercado

═══════════════════════════════════════
ETAPAS OBRIGATÓRIAS — MENTOR CONCISO v5
═══════════════════════════════════════
Execute TODAS as etapas abaixo, nessa ordem, sem pular nenhuma:

ETAPA 1 — COLETA DE DADOS (8 buscas mínimas obrigatórias):
  1. [sofascore.com] Forma dos últimos 5 jogos (V/E/D) + gols marcados/sofridos — time CASA
  2. [sofascore.com] Forma dos últimos 5 jogos (V/E/D) + gols marcados/sofridos — time VISITANTE
  3. [sofascore.com] xG/jogo, finalizações/jogo, posse de bola (%), precisão de passes (%) — AMBOS os times
  4. [sofascore.com] Desempenho em casa (time da casa) e desempenho fora (time visitante) separadamente
  5. [sofascore.com] Nota média SofaScore dos jogadores titulares — top performers de cada time
  6. [transfermarkt.com] Desfalques, lesões e suspensões confirmados para este jogo — confirmar se time titular ou reserva
  7. [sofascore.com ou bet365] Odds atuais + H2H recente entre os times (últimos 5 confrontos diretos)
  8. [primatips.com.br] Previsão/probabilidades PrimaTips para este jogo

ETAPA 2 — ESTRUTURAÇÃO DOS DADOS:
  Organize separando claramente os dois times em:
  - Força Ofensiva: gols marcados/jogo, xG/jogo, finalizações/jogo
  - Força Defensiva: gols sofridos/jogo, xGA/jogo
  - Estilo de Jogo: posse (%), precisão de passes (%), chutes ao gol/fora
  - Eficiência: conversão de finalizações em gols, xG vs gols reais
  - Desempenho contextual: em casa (mandante) vs fora (visitante)
  - Nota média SofaScore dos titulares
  - Posição na tabela e zona (título/classificação/meio/rebaixamento)
  - Escanteios: média por jogo, favor e contra

ETAPA 3 — CONVERSÃO EM ÍNDICES:
  Para cada time, converta os dados em:
  a) Índice de Força Ofensiva (0–10)
  b) Índice de Força Defensiva (0–10)
  c) Classificação de Estilo
  d) Eficiência Geral: relação xG vs gols marcados reais
  e) Classificação Defesa vs Ataque do adversário:
     - defesa_forte_vs_ataque_forte
     - defesa_forte_vs_ataque_fraco
     - defesa_fraca_vs_ataque_forte
     - defesa_fraca_vs_ataque_fraco

ETAPA 4 — COMPARAÇÃO DIRETA COM ANÁLISE DE PADRÕES:
  Compare os dois times explicitamente:
  - Ataque MANDANTE vs Defesa VISITANTE → vantagem e margem
  - Ataque VISITANTE vs Defesa MANDANTE → vantagem e margem
  - Estilo vs Estilo
  - Padrão BTTS: ambos os times costumam marcar? Defesas guardam?
  - Padrão de Gols: jogos com muitos gols ou poucos?
  - Padrão de Escanteios: times que forçam muitos escanteios vs poucos?
  - Tendência Half-Time/Full-Time (HT/FT): times que viram, times que mantêm resultado
  - Motivação: posição na tabela, zona de classificação, rebaixamento, título

ETAPA 5 — PONTUAÇÃO CONTEXTUAL (-2 a +2 por fator)

ETAPA 6 — CÁLCULO POISSON + PAREAMENTO:
  Calcule para gols: λ_casa e λ_visit
  Calcule probabilidades para TODOS os mercados de gols:
  - Over/Under 0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5
  - BTTS Sim/Não
  - Placar mais provável
  - HT/FT: probabilidades para as 9 combinações (Casa/Casa, Casa/Empate, Casa/Visit, Empate/Casa, Empate/Empate, Empate/Visit, Visit/Casa, Visit/Empate, Visit/Visit)
  
  Para escanteios: use média por jogo de ambos os times para calcular Over/Under 7.5, 8.5, 9.5, 10.5, 11.5

ETAPA 7 — PROBABILIDADES REAIS EXPANDIDAS:
  Gere probabilidades para TODOS os mercados:
  - 1X2 (vitória casa, empate, vitória visitante)
  - Over/Under: 0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 gols
  - BTTS Sim/Não
  - HT/FT (9 combinações)
  - Escanteios Over/Under: 7.5, 8.5, 9.5, 10.5, 11.5
  - Cartões Over/Under: 2.5, 3.5, 4.5, 5.5
  - Finalizações: jogador com 1+, 2+ chutes
  - Edge e Kelly para cada mercado
  - Provável escalação (titular vs reserva)

ETAPA 8 — TOP 2 APOSTAS RECOMENDADAS:
  Após analisar TODOS os mercados disponíveis, selecione as 2 MELHORES apostas para o jogo.
  Critérios de seleção:
  1. Maior edge positivo sustentado pelos dados
  2. Convergência de múltiplos indicadores (Poisson + forma + H2H + contexto)
  3. Disponibilidade de odds no mercado
  4. Risco vs retorno favorável
  
  Para cada aposta TOP, forneça:
  - Mercado específico
  - Odd estimada
  - Probabilidade real calculada
  - Edge financeiro
  - Justificativa baseada em DADOS REAIS (mínimo 3 dados numéricos)
  - Nível de confiança (0-100)
  - Por que esse mercado COMBINA com as características desses dois times
  - Principal risco
  
  IMPORTANTE: As Top 2 apostas devem ser de MERCADOS DIFERENTES (não recomendar 1X2 e 1X2, por exemplo).

═══════════════════════════════════════
ANÁLISE DE ESCALAÇÃO E MOTIVAÇÃO
═══════════════════════════════════════
Para cada time, avalie:
- Provável escalação: TITULAR COMPLETO | MISTO | RESERVAS
- Baseado em: competição em disputa, próximos jogos, lesões/suspensões
- Motivação: ALTA (título/classificação/evitar rebaixamento) | MÉDIA | BAIXA (eliminado/sem objetivo)
- Posição na tabela: TOPO (1-5) | INTERMEDIÁRIO (6-15) | REBAIXAMENTO (últimas 3 posições)
- Impacto da escalação nas probabilidades: se reservas → reduza λ em 20-30%

═══════════════════════════════════════
ANÁLISE BTTS (AMBAS MARCAM)
═══════════════════════════════════════
Calcule BTTS considerando:
- % de jogos com BTTS de cada time na temporada
- Força ofensiva de cada time vs vulnerabilidade defensiva do adversário
- H2H: % de jogos com BTTS nos últimos 5 confrontos
- Se defensivo_vs_ofensivo → BTTS Não favorecido
- Se ambos têm ataque forte e defesa vulnerável → BTTS Sim favorecido
- Forneça: probBttsSim, probBttsNao, tendenciaBtts (SIM_FORTE|SIM_MODERADO|NEUTRO|NAO_MODERADO|NAO_FORTE)

═══════════════════════════════════════
ANÁLISE HT/FT (RESULTADO INTERVALO/FINAL)
═══════════════════════════════════════
Calcule as 9 combinações HT/FT:
- Considere: qual time costuma abrir placar, qual time busca o jogo, qual time sofre viradas
- Histórico de HT/FT nos últimos 5 H2H
- Times que saem perdendo e viram vs times que mantêm vantagem
- Forneça os 3 resultados HT/FT mais prováveis com probabilidade e odd estimada

═══════════════════════════════════════
ANÁLISE OVER/UNDER EXPANDIDA
═══════════════════════════════════════
Para cada linha de gols (0.5 até 6.5):
- Calcule probabilidade usando Poisson com λ_casa e λ_visit
- Over 0.5: P(pelo menos 1 gol no jogo)
- Over 1.5: P(pelo menos 2 gols)
- Over 2.5: P(pelo menos 3 gols)
- Over 3.5: P(pelo menos 4 gols)
- Over 4.5: P(pelo menos 5 gols)
- Over 5.5: P(pelo menos 6 gols)
- Over 6.5: P(pelo menos 7 gols)
- Under é o complemento: Under X.5 = 100 - Over X.5
- Identifique qual linha tem MAIOR edge

═══════════════════════════════════════
ANÁLISE DE ESCANTEIOS
═══════════════════════════════════════
Para escanteios, use:
- Média de escanteios por jogo de cada time (a favor + contra)
- λ_escanteios = media_casa + media_visitante
- Calcule Over/Under para 7.5, 8.5, 9.5, 10.5, 11.5
- Time com posse alta → mais escanteios
- Time com pressão alta → mais escanteios
- Forneça: mediaEscanteiosCasa, mediaEscanteiosVisitante, lambdaEscanteios, e probabilidades

═══════════════════════════════════════
CLASSIFICAÇÃO DEFESA vs ATAQUE
═══════════════════════════════════════
Classifique o matchup em um dos 4 padrões:
1. DEFESA_FORTE_ATAQUE_FORTE: ambos defendem e atacam bem → jogo equilibrado, poucos gols, Under favorecido
2. DEFESA_FORTE_ATAQUE_FRACO: defensas dominam ataques → muito Under, BTTS Não
3. DEFESA_FRACA_ATAQUE_FORTE: ataques dominam defensas → Over favorecido, BTTS Sim
4. DEFESA_FRACA_ATAQUE_FRACO: impredizível → dados contextuais determinam
Para cada padrão, indique as apostas mais coerentes.

═══════════════════════════════════════
JOGADOR QUE MAIS FINALIZA / MAIS CARTÕES
═══════════════════════════════════════
TOP 3 finalizadores por time:
- finalizacoesPorJogo, chutesNoGol, xgPorJogo, golsTemporada
- prob1MaisFinalizacao (P de fazer 1+ chutes) = 1 - e^(-λ)
- prob2MaisFinalizacoes (P de fazer 2+ chutes) = 1 - e^(-λ)(1+λ)

TOP 3 jogadores com mais cartões por time:
- amareloPorJogo, cartoesTemporada
- Probabilidade de levar amarelo no jogo
- Se acumulado (próximo de suspensão): flag especial

═══════════════════════════════════════
REGRAS DE SINAL — BASEADAS EM DADOS
═══════════════════════════════════════
- APOSTAR: edge > 5% E pelo menos 3 indicadores convergem E dados de qualidade alta/média
- VALOR:   edge 2–5% E pelo menos 2 indicadores convergem
- LEVE:    edge 0–2% E indicadores ligeiramente favoráveis
- NEUTRO:  edge entre -2% e +2% OU indicadores contraditórios
- EVITAR:  edge < -2% OU dados insuficientes OU indicadores divergentes

⚠️ REGRA ANTI-CONTRADIÇÃO (CRÍTICA):
Antes de definir o sinal final, verifique coerência entre narrativa, Poisson e valueBets.
Se qualquer contradição → rebaixe o sinal um nível ou mude o mercado.

Siga EXATAMENTE este schema JSON expandido:

{
  "jogo": {
    "timeCasa": "Nome completo do time da casa",
    "timeVisitante": "Nome completo do time visitante",
    "campeonato": "Nome da competição",
    "rodada": "Rodada/Jornada X",
    "data": "DD/MM/AAAA HH:MM",
    "estadio": "Nome do Estádio - Cidade",
    "posicaoCasa": "Xº",
    "posicaoVisitante": "Xº",
    "pontosCasa": 0,
    "pontosVisitante": 0,
    "mediaLiga": 1.35,
    "zonaCasa": "TOPO|INTERMEDIÁRIO|REBAIXAMENTO",
    "zonaVisitante": "TOPO|INTERMEDIÁRIO|REBAIXAMENTO"
  },
  "escalacao": {
    "casa": {
      "provavelEscalacao": "TITULAR_COMPLETO|MISTO|RESERVAS",
      "motivacao": "ALTA|MÉDIA|BAIXA",
      "justificativa": "razão objetiva baseada em calendário e posição",
      "fatorAjuste": 1.0
    },
    "visitante": {
      "provavelEscalacao": "TITULAR_COMPLETO|MISTO|RESERVAS",
      "motivacao": "ALTA|MÉDIA|BAIXA",
      "justificativa": "razão objetiva baseada em calendário e posição",
      "fatorAjuste": 1.0
    }
  },
  "padraoMatchup": {
    "classificacao": "DEFESA_FORTE_ATAQUE_FORTE|DEFESA_FORTE_ATAQUE_FRACO|DEFESA_FRACA_ATAQUE_FORTE|DEFESA_FRACA_ATAQUE_FRACO",
    "forcaOfensivaCasa": 0.0,
    "forcaDefensivaCasa": 0.0,
    "forcaOfensivaVisitante": 0.0,
    "forcaDefensivaVisitante": 0.0,
    "implicacao": "O que este padrão sugere para os mercados de gols, BTTS e Over/Under",
    "mercadosFavorecidos": ["Over 2.5", "BTTS Sim"],
    "mercadosDesfavorecidos": ["Under 1.5", "BTTS Não"]
  },
  "estatisticasCasa": {
    "record": "XV XE XD",
    "golsMarcados": 0,
    "golsSofridos": 0,
    "golsMarcadosPorJogo": 0.0,
    "golsSofridosPorJogo": 0.0,
    "golsMarcadosEmCasa": 0.0,
    "golsSofridosEmCasa": 0.0,
    "xgPorJogo": 0.0,
    "xgaPorJogo": 0.0,
    "finalizacoesPorJogo": 0.0,
    "posse": 0,
    "precisaoPasses": 0,
    "notaMediaSofaScore": 0.0,
    "aproveitamento": 0,
    "emCasa": "XV XE XD",
    "aproveitamentoCasa": 0,
    "over25Pct": 0,
    "bttsSimPct": 0,
    "escanteiosFavor": 0.0,
    "escanteiosContra": 0.0,
    "mediaEscanteiosTotal": 0.0,
    "cartoesAmarelos": 0.0,
    "cartoesVermelhos": 0.0,
    "forcaOfensiva": 0.0,
    "forcaDefensiva": 0.0,
    "estiloJogo": "posse alta/baixa, pressão alta/baixa",
    "eficiencia": "descrição objetiva",
    "forma": ["V","D","E","V","D"],
    "formaPeso": [5,4,3,2,1],
    "formaPlacar": ["Adversário 2-1 (Casa)","Adversário 0-1","Adversário 1-1","Adversário 3-0","Adversário 1-2"],
    "scoreForma": 0,
    "htFtPadrao": "time que costuma manter ou virar"
  },
  "estatisticasVisitante": {
    "record": "XV XE XD",
    "golsMarcados": 0,
    "golsSofridos": 0,
    "golsMarcadosPorJogo": 0.0,
    "golsSofridosPorJogo": 0.0,
    "golsMarcadosFora": 0.0,
    "golsSofridosFora": 0.0,
    "xgPorJogo": 0.0,
    "xgaPorJogo": 0.0,
    "finalizacoesPorJogo": 0.0,
    "posse": 0,
    "precisaoPasses": 0,
    "notaMediaSofaScore": 0.0,
    "aproveitamento": 0,
    "fora": "XV XE XD",
    "aproveitamentoFora": 0,
    "over25Pct": 0,
    "bttsSimPct": 0,
    "escanteiosFavor": 0.0,
    "escanteiosContra": 0.0,
    "mediaEscanteiosTotal": 0.0,
    "cartoesAmarelos": 0.0,
    "cartoesVermelhos": 0.0,
    "forcaOfensiva": 0.0,
    "forcaDefensiva": 0.0,
    "estiloJogo": "posse alta/baixa, pressão alta/baixa",
    "eficiencia": "descrição objetiva",
    "forma": ["V","D","E","V","D"],
    "formaPeso": [5,4,3,2,1],
    "formaPlacar": ["Adversário 2-0","Adversário 1-3","Adversário 0-0","Adversário 1-0","Adversário 2-3"],
    "scoreForma": 0,
    "htFtPadrao": "time que costuma manter ou virar"
  },
  "comparacao": {
    "ataqueVsDefesa": "descrição explícita",
    "estiloVsEstilo": "qual time é favorecido",
    "vantagens": {
      "mandante": ["vantagem 1", "vantagem 2"],
      "visitante": ["vantagem 1", "vantagem 2"]
    },
    "dominioGeral": "mandante|visitante|equilibrado"
  },
  "contexto": [
    {"fator": "Importância na Tabela", "scoreCasa": 0, "scoreVisitante": 0, "justificativa": "breve razão"},
    {"fator": "Momento Recente (ponderado)", "scoreCasa": 0, "scoreVisitante": 0, "justificativa": "breve razão"},
    {"fator": "Fator Mando/Viagem", "scoreCasa": 0, "scoreVisitante": 0, "justificativa": "breve razão"},
    {"fator": "Desfalques e Impacto", "scoreCasa": 0, "scoreVisitante": 0, "justificativa": "breve razão"},
    {"fator": "H2H Histórico", "scoreCasa": 0, "scoreVisitante": 0, "justificativa": "breve razão"},
    {"fator": "Motivação/Pressão", "scoreCasa": 0, "scoreVisitante": 0, "justificativa": "breve razão"},
    {"fator": "Fadiga/Calendário", "scoreCasa": 0, "scoreVisitante": 0, "justificativa": "breve razão"}
  ],
  "desfalques": {
    "casa": ["Jogador (motivo/tempo estimado)"],
    "visitante": ["Jogador (motivo/tempo estimado)"],
    "retornosCasa": ["Jogador retorna após X"],
    "retornosVisitante": [],
    "impactoCasa": "baixo|médio|alto",
    "impactoVisitante": "baixo|médio|alto"
  },
  "h2h": {
    "resumo": "Casa XW XE XV nos últimos 5 H2H",
    "ultimoJogo": "Placar - Data - Competição",
    "mediaGols": 0.0,
    "bttsSimPct": 0,
    "placarMaisComum": "X-Y",
    "tendencia": "Descrição objetiva da tendência H2H",
    "jogosAnalisados": 5,
    "htFtMaisComum": "X/Y (HT/FT mais frequente nos H2H)",
    "mediaEscanteios": 0.0
  },
  "poisson": {
    "lambdaCasa": 0.0,
    "lambdaVisitante": 0.0,
    "ataqueCasa": 0.0,
    "defesaCasa": 0.0,
    "ataqueVisitante": 0.0,
    "defesaVisitante": 0.0,
    "probVitoriaCasa": 0,
    "probEmpate": 0,
    "probVitoriaVisitante": 0,
    "probOver05": 0,
    "probOver15": 0,
    "probOver25": 0,
    "probOver35": 0,
    "probOver45": 0,
    "probOver55": 0,
    "probOver65": 0,
    "probUnder05": 0,
    "probUnder15": 0,
    "probUnder25": 0,
    "probUnder35": 0,
    "probUnder45": 0,
    "probUnder55": 0,
    "probUnder65": 0,
    "probBttsSim": 0,
    "probBttsNao": 0,
    "tendenciaBtts": "SIM_FORTE|SIM_MODERADO|NEUTRO|NAO_MODERADO|NAO_FORTE",
    "placarMaisProvavel": "X-Y",
    "placarSegundo": "X-Y",
    "placarTerceiro": "X-Y",
    "validacao": "soma deve ser ~100"
  },
  "htFt": {
    "combinacoes": [
      {"resultado": "Casa/Casa", "prob": 0, "oddEstimada": 0.0, "sinal": "NEUTRO"},
      {"resultado": "Casa/Empate", "prob": 0, "oddEstimada": 0.0, "sinal": "NEUTRO"},
      {"resultado": "Casa/Visitante", "prob": 0, "oddEstimada": 0.0, "sinal": "NEUTRO"},
      {"resultado": "Empate/Casa", "prob": 0, "oddEstimada": 0.0, "sinal": "NEUTRO"},
      {"resultado": "Empate/Empate", "prob": 0, "oddEstimada": 0.0, "sinal": "NEUTRO"},
      {"resultado": "Empate/Visitante", "prob": 0, "oddEstimada": 0.0, "sinal": "NEUTRO"},
      {"resultado": "Visitante/Casa", "prob": 0, "oddEstimada": 0.0, "sinal": "NEUTRO"},
      {"resultado": "Visitante/Empate", "prob": 0, "oddEstimada": 0.0, "sinal": "NEUTRO"},
      {"resultado": "Visitante/Visitante", "prob": 0, "oddEstimada": 0.0, "sinal": "NEUTRO"}
    ],
    "topHtFt": "resultado HT/FT mais provável com justificativa",
    "padraoVirada": "Time X tem histórico de virar resultados em X% dos jogos"
  },
  "escanteios": {
    "mediaEscanteiosCasa": 0.0,
    "mediaEscanteiosVisitante": 0.0,
    "lambdaEscanteios": 0.0,
    "over75Pct": 0,
    "over85Pct": 0,
    "over95Pct": 0,
    "over105Pct": 0,
    "over115Pct": 0,
    "under75Pct": 0,
    "under85Pct": 0,
    "under95Pct": 0,
    "melhorLinhaEscanteios": "Over/Under X.5",
    "melhorLinhaProb": 0,
    "justificativa": "por que esta linha tem mais valor"
  },
  "pareamentoProbabilistico": {
    "sofascore": {
      "probVitoriaCasa": 0,
      "probEmpate": 0,
      "probVitoriaVisitante": 0,
      "fonte": "Poisson calculado com dados SofaScore"
    },
    "primatips": {
      "probVitoriaCasa": 0,
      "probEmpate": 0,
      "probVitoriaVisitante": 0,
      "fonte": "primatips.com.br|primatips.com|não encontrado",
      "urlConsultada": "https://primatips.com.br/..."
    },
    "consenso": {
      "probVitoriaCasa": 0,
      "probEmpate": 0,
      "probVitoriaVisitante": 0,
      "pesos": "SofaScore 60% + PrimaTips 40%",
      "divergenciaMaxima": 0.0,
      "statusConvergencia": "CONVERGÊNCIA CONFIRMADA|DIVERGÊNCIA MODERADA|DIVERGÊNCIA ALTA|PRIMATIPS INDISPONÍVEL",
      "interpretacao": "texto explicando o que a convergência/divergência implica para o edge"
    }
  },
  "finalizacoes": {
    "fonteDados": "SofaScore — shots/game por jogador",
    "mediaFinalCasa": 0.0,
    "mediaFinalVisitante": 0.0,
    "jogadoresCasa": [
      {
        "nome": "Nome do Jogador",
        "posicao": "AT|MEI|DEF",
        "finalizacoesPorJogo": 0.0,
        "chutesNoGol": 0.0,
        "xgPorJogo": 0.0,
        "golsTemporada": 0,
        "rankingFinalizacoes": 1,
        "prob1MaisChute": 0,
        "prob2MaisChutes": 0,
        "odd1MaisChute": 0.0,
        "odd2MaisChutes": 0.0,
        "sinalFinal": "APOSTAR|VALOR|LEVE|NEUTRO|EVITAR",
        "edge": 0,
        "titular": true,
        "observacao": "breve nota baseada em dado real"
      }
    ],
    "jogadoresVisitante": [
      {
        "nome": "Nome do Jogador",
        "posicao": "AT|MEI|DEF",
        "finalizacoesPorJogo": 0.0,
        "chutesNoGol": 0.0,
        "xgPorJogo": 0.0,
        "golsTemporada": 0,
        "rankingFinalizacoes": 1,
        "prob1MaisChute": 0,
        "prob2MaisChutes": 0,
        "odd1MaisChute": 0.0,
        "odd2MaisChutes": 0.0,
        "sinalFinal": "APOSTAR|VALOR|LEVE|NEUTRO|EVITAR",
        "edge": 0,
        "titular": true,
        "observacao": "breve nota baseada em dado real"
      }
    ]
  },
  "cartoes": {
    "mediaCasa": 0.0,
    "mediaVisitante": 0.0,
    "mediaJogo": 0.0,
    "over25CartoesPct": 0,
    "over35CartoesPct": 0,
    "over45CartoesPct": 0,
    "over55CartoesPct": 0,
    "arbitro": {
      "nome": "Nome do Árbitro",
      "mediaCartoesPorJogo": 0.0,
      "mediaAmarelos": 0.0,
      "mediaVermelhos": 0.0,
      "tendenciaRigido": false,
      "jogosAnalisados": 0
    },
    "jogadoresRisco": [
      {
        "nome": "Nome do Jogador",
        "time": "Casa|Visitante",
        "amareloPorJogo": 0.0,
        "cartoesTemporada": 0,
        "suspensoProxJogo": false,
        "acumulado": false,
        "probAmareloJogo": 0,
        "probVermelhoJogo": 0,
        "odd": 0.0,
        "sinal": "APOSTAR|VALOR|LEVE|NEUTRO|EVITAR"
      }
    ],
    "oddOver35Cartoes": 0.0,
    "oddOver45Cartoes": 0.0,
    "recomendacaoCartoes": "descrição objetiva"
  },
  "odds": {
    "fonte": "Bet365|Betano|Pinnacle|estimada",
    "casa": 0.0,
    "empate": 0.0,
    "visitante": 0.0,
    "over05": 0.0,
    "over15": 0.0,
    "over25": 0.0,
    "over35": 0.0,
    "over45": 0.0,
    "under05": 0.0,
    "under15": 0.0,
    "under25": 0.0,
    "under35": 0.0,
    "under45": 0.0,
    "bttsSimOdd": 0.0,
    "bttsNaoOdd": 0.0,
    "escanteiosOver85": 0.0,
    "escanteiosOver95": 0.0,
    "escanteiosOver105": 0.0
  },
  "valueBets": [
    {"mercado": "Vitória Casa (1)", "probReal": 0, "oddMercado": 0.0, "probImplicita": 0, "edge": 0, "sinal": "APOSTAR|VALOR|LEVE|NEUTRO|EVITAR", "kelly": 0.0},
    {"mercado": "Empate (X)", "probReal": 0, "oddMercado": 0.0, "probImplicita": 0, "edge": 0, "sinal": "APOSTAR|VALOR|LEVE|NEUTRO|EVITAR", "kelly": 0.0},
    {"mercado": "Vitória Visitante (2)", "probReal": 0, "oddMercado": 0.0, "probImplicita": 0, "edge": 0, "sinal": "APOSTAR|VALOR|LEVE|NEUTRO|EVITAR", "kelly": 0.0},
    {"mercado": "Over 0.5 Gols", "probReal": 0, "oddMercado": 0.0, "probImplicita": 0, "edge": 0, "sinal": "APOSTAR|VALOR|LEVE|NEUTRO|EVITAR", "kelly": 0.0},
    {"mercado": "Over 1.5 Gols", "probReal": 0, "oddMercado": 0.0, "probImplicita": 0, "edge": 0, "sinal": "APOSTAR|VALOR|LEVE|NEUTRO|EVITAR", "kelly": 0.0},
    {"mercado": "Over 2.5 Gols", "probReal": 0, "oddMercado": 0.0, "probImplicita": 0, "edge": 0, "sinal": "APOSTAR|VALOR|LEVE|NEUTRO|EVITAR", "kelly": 0.0},
    {"mercado": "Over 3.5 Gols", "probReal": 0, "oddMercado": 0.0, "probImplicita": 0, "edge": 0, "sinal": "APOSTAR|VALOR|LEVE|NEUTRO|EVITAR", "kelly": 0.0},
    {"mercado": "Over 4.5 Gols", "probReal": 0, "oddMercado": 0.0, "probImplicita": 0, "edge": 0, "sinal": "APOSTAR|VALOR|LEVE|NEUTRO|EVITAR", "kelly": 0.0},
    {"mercado": "Under 1.5 Gols", "probReal": 0, "oddMercado": 0.0, "probImplicita": 0, "edge": 0, "sinal": "APOSTAR|VALOR|LEVE|NEUTRO|EVITAR", "kelly": 0.0},
    {"mercado": "Under 2.5 Gols", "probReal": 0, "oddMercado": 0.0, "probImplicita": 0, "edge": 0, "sinal": "APOSTAR|VALOR|LEVE|NEUTRO|EVITAR", "kelly": 0.0},
    {"mercado": "Under 3.5 Gols", "probReal": 0, "oddMercado": 0.0, "probImplicita": 0, "edge": 0, "sinal": "APOSTAR|VALOR|LEVE|NEUTRO|EVITAR", "kelly": 0.0},
    {"mercado": "BTTS Sim", "probReal": 0, "oddMercado": 0.0, "probImplicita": 0, "edge": 0, "sinal": "APOSTAR|VALOR|LEVE|NEUTRO|EVITAR", "kelly": 0.0},
    {"mercado": "BTTS Não", "probReal": 0, "oddMercado": 0.0, "probImplicita": 0, "edge": 0, "sinal": "APOSTAR|VALOR|LEVE|NEUTRO|EVITAR", "kelly": 0.0},
    {"mercado": "Escanteios Over 8.5", "probReal": 0, "oddMercado": 0.0, "probImplicita": 0, "edge": 0, "sinal": "APOSTAR|VALOR|LEVE|NEUTRO|EVITAR", "kelly": 0.0},
    {"mercado": "Escanteios Over 9.5", "probReal": 0, "oddMercado": 0.0, "probImplicita": 0, "edge": 0, "sinal": "APOSTAR|VALOR|LEVE|NEUTRO|EVITAR", "kelly": 0.0},
    {"mercado": "Escanteios Over 10.5", "probReal": 0, "oddMercado": 0.0, "probImplicita": 0, "edge": 0, "sinal": "APOSTAR|VALOR|LEVE|NEUTRO|EVITAR", "kelly": 0.0},
    {"mercado": "Over 3.5 Cartões", "probReal": 0, "oddMercado": 0.0, "probImplicita": 0, "edge": 0, "sinal": "APOSTAR|VALOR|LEVE|NEUTRO|EVITAR", "kelly": 0.0},
    {"mercado": "Over 4.5 Cartões", "probReal": 0, "oddMercado": 0.0, "probImplicita": 0, "edge": 0, "sinal": "APOSTAR|VALOR|LEVE|NEUTRO|EVITAR", "kelly": 0.0}
  ],
  "top2Apostas": [
    {
      "posicao": 1,
      "titulo": "APOSTA PRINCIPAL",
      "mercado": "Nome específico do mercado (ex: Over 2.5 Gols, BTTS Sim, Vitória Casa...)",
      "odd": 0.0,
      "probReal": 0,
      "probImplicita": 0,
      "edge": 0,
      "kelly": 0.0,
      "unidades": "X unidades (Kelly÷4)",
      "confianca": 0,
      "sinal": "APOSTAR|VALOR|LEVE",
      "porQueEsseMercado": "Explicação de por que esse mercado combina com as características ESPECÍFICAS desses 2 times (mínimo 3 dados numéricos reais)",
      "dadosQueEmbasam": [
        "Dado numérico concreto 1",
        "Dado numérico concreto 2",
        "Dado numérico concreto 3"
      ],
      "padraoCombinado": "Como o padrão ofensivo/defensivo dos 2 times apoia essa aposta",
      "h2hSuporta": true,
      "contextoSuporta": true,
      "principalRisco": "O que poderia invalidar esta aposta",
      "alertas": ["alerta específico se houver"]
    },
    {
      "posicao": 2,
      "titulo": "APOSTA ALTERNATIVA",
      "mercado": "Nome de um mercado DIFERENTE da aposta 1",
      "odd": 0.0,
      "probReal": 0,
      "probImplicita": 0,
      "edge": 0,
      "kelly": 0.0,
      "unidades": "X unidades (Kelly÷4)",
      "confianca": 0,
      "sinal": "APOSTAR|VALOR|LEVE",
      "porQueEsseMercado": "Explicação com pelo menos 3 dados numéricos reais",
      "dadosQueEmbasam": [
        "Dado numérico concreto 1",
        "Dado numérico concreto 2",
        "Dado numérico concreto 3"
      ],
      "padraoCombinado": "Como o padrão dos 2 times apoia essa aposta",
      "h2hSuporta": true,
      "contextoSuporta": true,
      "principalRisco": "O que poderia invalidar esta aposta",
      "alertas": []
    }
  ],
  "recomendacao": {
    "veredicto": "APOSTAR|VALOR|LEVE|NEUTRO|EVITAR",
    "principal": "Descrição clara da conclusão",
    "mercado": "Nome do mercado OU 'Nenhum — jogo sem edge'",
    "odd": 0.0,
    "unidades": "X unidades (Kelly÷4) OU '0 — sem aposta recomendada'",
    "confianca": 0,
    "indicadoresConvergentes": ["indicador 1", "indicador 2"],
    "indicadoresDivergentes": ["contraponto 1", "risco principal"],
    "alternativa": "Mercado alternativo com justificativa",
    "narrativa": "3-4 frases: dados concretos + risco principal + veredito probabilístico honesto",
    "alertas": ["Alerta específico com dado real"],
    "qualidadeDados": "alta|media|baixa",
    "fontesConsultadas": ["fonte1", "fonte2"]
  }
}

AUTOVALIDAÇÃO ANTES DE RETORNAR (12 checkpoints obrigatórios):
1. probVitoriaCasa + probEmpate + probVitoriaVisitante = ~100? ✓
2. probOver25 + probUnder25 = ~100? ✓
3. O sinal da recomendação é coerente com os valueBets? ✓
4. A narrativa cita dados numéricos reais (não genéricos)? ✓
5. As Top 2 apostas são de mercados diferentes? ✓
6. As Top 2 apostas citam pelo menos 3 dados numéricos cada? ✓
7. O campo pareamentoProbabilistico foi preenchido? ✓
8. Os TOP 3 finalizadores de cada time foram buscados? ✓
9. O padraoMatchup foi classificado (defesa vs ataque)? ✓
10. O HT/FT foi calculado com as 9 combinações? ✓
11. Os escanteios foram calculados com lambda? ✓
12. CHECAGEM MENTOR HARD — Existe contradição entre narrativa, Poisson e valueBets? Se sim, resolva antes. ✓

RETORNE APENAS O JSON, absolutamente nada mais`;

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const TAG_COLORS = {
  APOSTAR: { bg: "#0A2E1A", text: "#4ADE80", border: "#166534" },
  VALOR:   { bg: "#132510", text: "#86EFAC", border: "#14532D" },
  LEVE:    { bg: "#2D2000", text: "#FCD34D", border: "#78350F" },
  NEUTRO:  { bg: "#16181C", text: "#6B7280", border: "#374151" },
  EVITAR:  { bg: "#2D0A0A", text: "#F87171", border: "#7F1D1D" },
};

const FORM_COLORS = {
  V: { bg: "#0A2E1A", text: "#4ADE80", border: "#166534" },
  E: { bg: "#1A1D24", text: "#64748B", border: "#334155" },
  D: { bg: "#2D0A0A", text: "#F87171", border: "#7F1D1D" },
};

const IMPACTO_COLOR = { baixo: "#4ADE80", médio: "#FCD34D", alto: "#F87171" };

const MATCHUP_COLORS = {
  DEFESA_FORTE_ATAQUE_FORTE:  { bg: "#132038", text: "#60A5FA", border: "#1E3A5F", icon: "🛡️⚔️" },
  DEFESA_FORTE_ATAQUE_FRACO:  { bg: "#0D2318", text: "#4ADE80", border: "#166534", icon: "🛡️🔒" },
  DEFESA_FRACA_ATAQUE_FORTE:  { bg: "#2D1500", text: "#FB923C", border: "#7C2D12", icon: "⚽🔥" },
  DEFESA_FRACA_ATAQUE_FRACO:  { bg: "#1E1A0A", text: "#FCD34D", border: "#78350F", icon: "❓⚖️" },
};

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────
function Tag({ sinal }) {
  const c = TAG_COLORS[sinal] || TAG_COLORS.NEUTRO;
  return (
    <span style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      borderRadius: 4, fontSize: 9, fontWeight: 800, padding: "2px 7px",
      letterSpacing: "0.08em", fontFamily: "inherit", whiteSpace: "nowrap"
    }}>{sinal}</span>
  );
}

function FormDot({ r }) {
  const c = FORM_COLORS[r] || FORM_COLORS.E;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 22, height: 22, borderRadius: "50%", background: c.bg, color: c.text,
      fontSize: 9, fontWeight: 800, border: `1px solid ${c.border}`,
    }}>{r}</span>
  );
}

function Score({ val, max = 5 }) {
  const pct = (val / max) * 100;
  const color = val >= 4 ? "#4ADE80" : val >= 3 ? "#FCD34D" : "#F87171";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 4, background: "#1A1D24", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2 }} />
      </div>
      <span style={{ color, fontWeight: 700, fontSize: 11, minWidth: 14 }}>{val}</span>
    </div>
  );
}

function ProbBar({ label, prob, color }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: "#94A3B8" }}>{label}</span>
        <span style={{ fontWeight: 800, color }}>{prob}%</span>
      </div>
      <div style={{ height: 5, background: "#1A1D24", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(prob, 100)}%`, height: "100%", background: color, borderRadius: 3 }} />
      </div>
    </div>
  );
}

function Section({ title, children, icon }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: "#334155", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ height: 1, flex: 1, background: "linear-gradient(to right, #1A1D24, transparent)" }} />
        {icon && <span style={{ fontSize: 12 }}>{icon}</span>}
        {title}
        <div style={{ height: 1, flex: 1, background: "linear-gradient(to left, #1A1D24, transparent)" }} />
      </div>
      {children}
    </div>
  );
}

function Card({ children, style = {}, accent }) {
  return (
    <div style={{
      background: "#0C0F14", border: `1px solid ${accent || "#1A1D24"}`,
      borderRadius: 10, padding: "14px 16px",
      boxShadow: accent ? `0 0 0 1px ${accent}18 inset` : "none",
      ...style
    }}>{children}</div>
  );
}

function StatRow({ label, value, highlight, sub }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #1A1D2490", fontSize: 12 }}>
      <span style={{ color: "#475569" }}>{label}</span>
      <div style={{ textAlign: "right" }}>
        <span style={{ fontWeight: 600, color: highlight || "#CBD5E1" }}>{value ?? "—"}</span>
        {sub && <span style={{ fontSize: 10, color: "#475569", marginLeft: 4 }}>{sub}</span>}
      </div>
    </div>
  );
}

function AlertaBadge({ tipo }) {
  const colors = { alta: "#4ADE80", media: "#FCD34D", baixa: "#F87171" };
  return (
    <span style={{ fontSize: 9, fontWeight: 700, color: colors[tipo] || "#94A3B8", border: `1px solid ${colors[tipo] || "#94A3B8"}40`, padding: "1px 5px", borderRadius: 3 }}>
      DADOS {tipo?.toUpperCase()}
    </span>
  );
}

function ProbPill({ label, prob, highlight }) {
  return (
    <div style={{ textAlign: "center", background: "#070A0F", border: `1px solid ${highlight ? "#1E3A5F" : "#1A1D24"}`, borderRadius: 8, padding: "8px 6px", minWidth: 60 }}>
      <div style={{ fontSize: 9, color: "#334155", marginBottom: 3, letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: highlight || "#94A3B8" }}>{prob}%</div>
    </div>
  );
}

// ─── VALIDATION ───────────────────────────────────────────────────────────────
function validateData(parsed) {
  const warnings = [];
  const { poisson, valueBets } = parsed;
  if (poisson) {
    const soma = (poisson.probVitoriaCasa || 0) + (poisson.probEmpate || 0) + (poisson.probVitoriaVisitante || 0);
    if (Math.abs(soma - 100) > 5) warnings.push(`⚠️ Probabilidades 1X2 somam ${soma.toFixed(1)}% (esperado ≈100%)`);
    const overUnder = (poisson.probOver25 || 0) + (poisson.probUnder25 || 0);
    if (Math.abs(overUnder - 100) > 5) warnings.push(`⚠️ Over/Under 2.5 somam ${overUnder.toFixed(1)}%`);
  }
  if (valueBets) {
    valueBets.forEach(b => {
      if (!b.oddMercado) return;
      const implied = parseFloat((100 / b.oddMercado).toFixed(1));
      const edgeReal = parseFloat((b.probReal - implied).toFixed(1));
      if (Math.abs(edgeReal - b.edge) > 2) warnings.push(`⚠️ Edge inconsistente em "${b.mercado}": calc ${edgeReal}%, declarado ${b.edge}%`);
    });
  }
  return warnings;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AnalisadorJogos() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [stepIdx, setStepIdx] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const inputRef = useRef(null);

  const STEPS = [
    "🔍 Buscando forma + gols/sofridos (SofaScore)...",
    "📊 Coletando xG, finalizações, posse, passes...",
    "🏠 Desempenho casa/fora separado...",
    "⭐ Nota média SofaScore dos titulares...",
    "⚽ Desfalques, escalação provável (Transfermarkt)...",
    "📈 Consultando odds do mercado...",
    "🟨 Cartões + árbitro + escanteios...",
    "🔗 Pareando SofaScore × PrimaTips...",
    "🧮 Calculando Poisson + Over/Under 0.5~6.5...",
    "🎯 Calculando HT/FT + BTTS + Escanteios...",
    "🏆 Identificando TOP 2 apostas do jogo...",
    "✅ Validação final — Mentor Conciso Hard v5...",
  ];

  async function analisar() {
    if (!input.trim() || loading) return;
    setLoading(true);
    setData(null);
    setError(null);
    setWarnings([]);
    setActiveTab("overview");

    let idx = 0;
    setStep(STEPS[0]);
    setStepIdx(0);
    const interval = setInterval(() => {
      idx = (idx + 1) % STEPS.length;
      setStep(STEPS[idx]);
      setStepIdx(idx);
    }, 3500);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 14000,
          system: SYSTEM_PROMPT,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: `Analise o jogo: ${input.trim()}` }],
        }),
      });

      const raw = await res.json();
      clearInterval(interval);

      if (raw.error) throw new Error(`API Anthropic: ${raw.error.message || raw.error.type}`);
      if (raw.stop_reason === "max_tokens") throw new Error("Resposta truncada (max_tokens). Tente novamente.");

      let text = "";
      if (raw.content) for (const block of raw.content) if (block.type === "text") text += block.text;
      if (!text.trim()) throw new Error("Resposta vazia da API.");

      text = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      if (jsonStart === -1 || jsonEnd === -1) throw new Error("JSON não encontrado na resposta.");
      text = text.substring(jsonStart, jsonEnd + 1);

      const parsed = JSON.parse(text);
      setWarnings(validateData(parsed));
      setData(parsed);
    } catch (e) {
      clearInterval(interval);
      setError(e.message || "Erro desconhecido.");
    } finally {
      setLoading(false);
      setStep("");
      setStepIdx(0);
    }
  }

  function handleKey(e) { if (e.key === "Enter") analisar(); }

  const TABS = [
    { id: "overview", label: "Visão Geral", icon: "📊" },
    { id: "goals", label: "Gols & Over/Under", icon: "⚽" },
    { id: "htft", label: "HT/FT", icon: "🔄" },
    { id: "corners", label: "Escanteios", icon: "🚩" },
    { id: "cards", label: "Cartões", icon: "🟨" },
    { id: "players", label: "Jogadores", icon: "🎯" },
    { id: "top2", label: "TOP 2 APOSTAS", icon: "🏆" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#070A0F",
      color: "#CBD5E1",
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      padding: "20px 16px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Bebas+Neue&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#4ADE80", letterSpacing: "0.25em", marginBottom: 6 }}>
          ◆ SPORTS INTELLIGENCE SYSTEM · MENTOR CONCISO v5 ◆
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, color: "#F1F5F9", letterSpacing: "0.04em", lineHeight: 1 }}>
          ANALISADOR DE JOGOS
        </div>
        <div style={{ fontSize: 10, color: "#334155", marginTop: 6, letterSpacing: "0.08em" }}>
          OVER/UNDER 0.5~6.5 · BTTS · HT/FT · ESCANTEIOS · CARTÕES · FINALIZAÇÕES · TOP 2 APOSTAS
        </div>
      </div>

      {/* Input */}
      <div style={{ maxWidth: 660, margin: "0 auto 24px" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ex: Flamengo x Palmeiras (Brasileirão Série A)"
            style={{
              flex: 1, background: "#0C0F14", border: "1px solid #1E2535",
              borderRadius: 8, padding: "12px 14px", color: "#F1F5F9",
              fontSize: 13, outline: "none", fontFamily: "inherit",
            }}
            onFocus={e => e.target.style.borderColor = "#166534"}
            onBlur={e => e.target.style.borderColor = "#1E2535"}
          />
          <button
            onClick={analisar}
            disabled={loading || !input.trim()}
            style={{
              background: loading ? "#0C0F14" : "#0F4C2A",
              color: loading ? "#334155" : "#4ADE80",
              border: `1px solid ${loading ? "#1E2535" : "#166534"}`,
              borderRadius: 8, padding: "12px 22px", fontWeight: 700,
              fontSize: 13, cursor: loading ? "not-allowed" : "pointer",
              whiteSpace: "nowrap", fontFamily: "inherit",
            }}
          >{loading ? "···" : "ANALISAR →"}</button>
        </div>
        <div style={{ fontSize: 10, color: "#1E2535", marginTop: 5, textAlign: "center" }}>
          Inclua a competição para melhor precisão · "Arsenal x Chelsea (Premier League)"
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⚽</div>
          <div style={{ color: "#4ADE80", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{step}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 10 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                width: i === stepIdx ? 18 : 5, height: 4,
                borderRadius: 2, background: i === stepIdx ? "#4ADE80" : "#1E2535",
                transition: "all 0.4s ease",
              }} />
            ))}
          </div>
          <div style={{ color: "#334155", fontSize: 10, marginTop: 10 }}>
            Executando {STEPS.length} etapas — incluindo Over/Under 0.5~6.5, HT/FT, Escanteios e TOP 2 Apostas...
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ maxWidth: 660, margin: "0 auto 16px", background: "#2D0A0A", border: "1px solid #7F1D1D", borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#F87171", marginBottom: 4 }}>⚠️ ERRO NA ANÁLISE</div>
          <div style={{ fontSize: 12, color: "#FCA5A5", lineHeight: 1.6 }}>{error}</div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && !loading && (
        <div style={{ maxWidth: 920, margin: "0 auto 16px", background: "#2D1A00", border: "1px solid #78350F", borderRadius: 10, padding: "12px 16px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#FCD34D", marginBottom: 6 }}>⚡ AVISOS DE VALIDAÇÃO</div>
          {warnings.map((w, i) => <div key={i} style={{ fontSize: 11, color: "#D97706", marginBottom: 3 }}>{w}</div>)}
        </div>
      )}

      {/* Results */}
      {data && !loading && (() => {
        const {
          jogo, estatisticasCasa: ec, estatisticasVisitante: ev,
          contexto, desfalques, h2h, poisson, odds, valueBets, recomendacao,
          finalizacoes, cartoes, pareamentoProbabilistico: pareamento, comparacao,
          htFt, escanteios, padraoMatchup, escalacao, top2Apostas
        } = data;

        const ctx = contexto || [];
        const totalCasa = ctx.reduce((s, c) => s + (c.scoreCasa || 0), 0);
        const totalVisit = ctx.reduce((s, c) => s + (c.scoreVisitante || 0), 0);
        const maxCtx = ctx.length * 5;

        return (
          <div style={{ maxWidth: 940, margin: "0 auto" }}>

            {/* Match Header */}
            <div style={{ background: "#0C0F14", border: "1px solid #1A1D24", borderRadius: 12, padding: "20px 22px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(to right, #166534, #4ADE80, #166534)" }} />
              <div style={{ fontSize: 9, color: "#4ADE80", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 10, textAlign: "center" }}>
                {jogo.campeonato} · {jogo.rodada}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 10 }}>
                <div style={{ flex: 1, textAlign: "right" }}>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color: "#F1F5F9" }}>{jogo.timeCasa}</div>
                  <div style={{ fontSize: 10, color: "#475569", marginBottom: 2 }}>{jogo.posicaoCasa} · {jogo.pontosCasa} pts</div>
                  {jogo.zonaCasa && (
                    <div style={{ fontSize: 9, fontWeight: 700, color: jogo.zonaCasa === "TOPO" ? "#4ADE80" : jogo.zonaCasa === "REBAIXAMENTO" ? "#F87171" : "#FCD34D", marginBottom: 4 }}>
                      {jogo.zonaCasa}
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 3 }}>
                    {(ec.forma || []).map((f, i) => <FormDot key={i} r={f} />)}
                  </div>
                </div>
                <div style={{ background: "#070A0F", border: "1px solid #1A1D24", borderRadius: 8, padding: "10px 18px", fontSize: 14, fontWeight: 700, color: "#334155", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.1em" }}>
                  VS
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color: "#F1F5F9" }}>{jogo.timeVisitante}</div>
                  <div style={{ fontSize: 10, color: "#475569", marginBottom: 2 }}>{jogo.posicaoVisitante} · {jogo.pontosVisitante} pts</div>
                  {jogo.zonaVisitante && (
                    <div style={{ fontSize: 9, fontWeight: 700, color: jogo.zonaVisitante === "TOPO" ? "#4ADE80" : jogo.zonaVisitante === "REBAIXAMENTO" ? "#F87171" : "#FCD34D", marginBottom: 4 }}>
                      {jogo.zonaVisitante}
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "flex-start", gap: 3 }}>
                    {(ev.forma || []).map((f, i) => <FormDot key={i} r={f} />)}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "center", fontSize: 10, color: "#334155" }}>
                📅 {jogo.data} &nbsp;·&nbsp; 🏟️ {jogo.estadio}
              </div>
              {recomendacao?.qualidadeDados && (
                <div style={{ textAlign: "center", marginTop: 8 }}>
                  <AlertaBadge tipo={recomendacao.qualidadeDados} />
                  {recomendacao.fontesConsultadas?.length > 0 && (
                    <span style={{ fontSize: 9, color: "#334155", marginLeft: 8 }}>
                      Fontes: {recomendacao.fontesConsultadas.join(", ")}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* TOP 2 APOSTAS BANNER */}
            {top2Apostas && top2Apostas.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: "#FCD34D", letterSpacing: "0.15em", marginBottom: 10, textAlign: "center" }}>
                  ★ TOP 2 APOSTAS RECOMENDADAS PARA ESTE JOGO ★
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {top2Apostas.map((ap, i) => {
                    const isMain = i === 0;
                    const c = TAG_COLORS[ap.sinal] || TAG_COLORS.NEUTRO;
                    return (
                      <div key={i} style={{
                        background: isMain ? "#0A2E1A" : "#0C1424",
                        border: `2px solid ${isMain ? "#166534" : "#1E3A5F"}`,
                        borderRadius: 12, padding: "14px 16px", position: "relative", overflow: "hidden"
                      }}>
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: isMain ? "linear-gradient(to right, #4ADE80, #166534)" : "linear-gradient(to right, #60A5FA, #1E3A5F)" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontSize: 8, fontWeight: 800, color: isMain ? "#4ADE80" : "#60A5FA", letterSpacing: "0.1em" }}>
                            {isMain ? "★ APOSTA PRINCIPAL" : "★ APOSTA ALTERNATIVA"}
                          </span>
                          <Tag sinal={ap.sinal} />
                        </div>
                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, color: "#F1F5F9", marginBottom: 6 }}>
                          {ap.mercado}
                        </div>
                        <div style={{ display: "flex", gap: 14, fontSize: 11, marginBottom: 8, flexWrap: "wrap" }}>
                          <span>Odd: <b style={{ color: isMain ? "#4ADE80" : "#60A5FA" }}>{ap.odd}</b></span>
                          <span>P.Real: <b style={{ color: "#FCD34D" }}>{ap.probReal}%</b></span>
                          <span>Edge: <b style={{ color: ap.edge > 0 ? "#4ADE80" : "#F87171" }}>{ap.edge > 0 ? "+" : ""}{ap.edge}%</b></span>
                          <span>Conf: <b style={{ color: ap.confianca >= 65 ? "#4ADE80" : "#FCD34D" }}>{ap.confianca}%</b></span>
                        </div>
                        <div style={{ fontSize: 10, color: isMain ? "#4ADE8099" : "#60A5FA99", lineHeight: 1.6, marginBottom: 6 }}>
                          {ap.porQueEsseMercado}
                        </div>
                        {(ap.dadosQueEmbasam || []).map((d, di) => (
                          <div key={di} style={{ fontSize: 10, color: "#475569", marginBottom: 2 }}>• {d}</div>
                        ))}
                        {ap.principalRisco && (
                          <div style={{ marginTop: 8, fontSize: 9, color: "#F87171AA", borderTop: "1px solid #1A1D24", paddingTop: 6 }}>
                            ⚠️ {ap.principalRisco}
                          </div>
                        )}
                        {ap.unidades && (
                          <div style={{ marginTop: 6, fontSize: 9, fontWeight: 700, color: isMain ? "#4ADE80" : "#60A5FA" }}>
                            Stake: {ap.unidades}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: activeTab === tab.id ? (tab.id === "top2" ? "#1A1400" : "#0F4C2A") : "#0C0F14",
                    color: activeTab === tab.id ? (tab.id === "top2" ? "#FCD34D" : "#4ADE80") : "#475569",
                    border: `1px solid ${activeTab === tab.id ? (tab.id === "top2" ? "#78350F" : "#166534") : "#1A1D24"}`,
                    borderRadius: 8, padding: "7px 12px", fontSize: 10, fontWeight: 700,
                    cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit",
                    letterSpacing: "0.05em",
                  }}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* TAB: OVERVIEW */}
            {activeTab === "overview" && (
              <>
                {/* Padrão Matchup */}
                {padraoMatchup && (() => {
                  const mc = MATCHUP_COLORS[padraoMatchup.classificacao] || { bg: "#16181C", text: "#6B7280", border: "#374151", icon: "⚖️" };
                  return (
                    <Section title="Padrão do Confronto — Defesa vs Ataque" icon="⚔️">
                      <Card accent={mc.border} style={{ background: mc.bg }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                          <span style={{ fontSize: 22 }}>{mc.icon}</span>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: mc.text, letterSpacing: "0.08em" }}>
                              {padraoMatchup.classificacao?.replace(/_/g, " ")}
                            </div>
                            <div style={{ fontSize: 11, color: mc.text + "99", marginTop: 2, lineHeight: 1.5 }}>
                              {padraoMatchup.implicacao}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
                          <div>
                            <div style={{ fontSize: 9, color: "#4ADE80", fontWeight: 800, marginBottom: 4 }}>✓ MERCADOS FAVORECIDOS</div>
                            {(padraoMatchup.mercadosFavorecidos || []).map((m, i) => (
                              <div key={i} style={{ fontSize: 11, color: "#4ADE8099", marginBottom: 3 }}>• {m}</div>
                            ))}
                          </div>
                          <div>
                            <div style={{ fontSize: 9, color: "#F87171", fontWeight: 800, marginBottom: 4 }}>✗ MERCADOS DESFAVORECIDOS</div>
                            {(padraoMatchup.mercadosDesfavorecidos || []).map((m, i) => (
                              <div key={i} style={{ fontSize: 11, color: "#F8717199", marginBottom: 3 }}>• {m}</div>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                          {[
                            { label: `Ataque ${jogo.timeCasa}`, val: padraoMatchup.forcaOfensivaCasa, color: "#4ADE80" },
                            { label: `Defesa ${jogo.timeCasa}`, val: padraoMatchup.forcaDefensivaCasa, color: "#60A5FA" },
                            { label: `Ataque ${jogo.timeVisitante}`, val: padraoMatchup.forcaOfensivaVisitante, color: "#4ADE80" },
                            { label: `Defesa ${jogo.timeVisitante}`, val: padraoMatchup.forcaDefensivaVisitante, color: "#60A5FA" },
                          ].map((item, i) => (
                            <div key={i} style={{ textAlign: "center", background: "#07090E", borderRadius: 6, padding: "8px 4px", border: "1px solid #1A1D24" }}>
                              <div style={{ fontSize: 8, color: "#334155", marginBottom: 3 }}>{item.label}</div>
                              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: item.val >= 7 ? "#4ADE80" : item.val >= 5 ? "#FCD34D" : "#F87171" }}>
                                {item.val}/10
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </Section>
                  );
                })()}

                {/* Escalação + Motivação */}
                {escalacao && (
                  <Section title="Escalação Provável & Motivação" icon="👕">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {[
                        { time: jogo.timeCasa, esc: escalacao.casa, color: "#4ADE80", accent: "#166534" },
                        { time: jogo.timeVisitante, esc: escalacao.visitante, color: "#60A5FA", accent: "#1E3A5F" },
                      ].map(({ time, esc, color, accent }) => esc && (
                        <Card key={time} accent={accent}>
                          <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 8 }}>{time}</div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: esc.provavelEscalacao === "TITULAR_COMPLETO" ? "#4ADE80" : esc.provavelEscalacao === "RESERVAS" ? "#F87171" : "#FCD34D", border: `1px solid ${esc.provavelEscalacao === "TITULAR_COMPLETO" ? "#166534" : esc.provavelEscalacao === "RESERVAS" ? "#7F1D1D" : "#78350F"}`, padding: "2px 7px", borderRadius: 4 }}>
                              {esc.provavelEscalacao?.replace(/_/g, " ")}
                            </span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: esc.motivacao === "ALTA" ? "#4ADE80" : esc.motivacao === "BAIXA" ? "#F87171" : "#FCD34D", border: `1px solid ${esc.motivacao === "ALTA" ? "#166534" : esc.motivacao === "BAIXA" ? "#7F1D1D" : "#78350F"}`, padding: "2px 7px", borderRadius: 4 }}>
                              MOTIVAÇÃO {esc.motivacao}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.5 }}>{esc.justificativa}</div>
                          {esc.fatorAjuste && esc.fatorAjuste !== 1.0 && (
                            <div style={{ fontSize: 10, color: "#F87171", marginTop: 6 }}>
                              ⚡ Fator de ajuste λ: ×{esc.fatorAjuste}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Stats */}
                <Section title="Desempenho na Temporada" icon="📊">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Card accent="#166534">
                      <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: "#4ADE80", fontSize: 12, marginBottom: 10 }}>
                        {jogo.timeCasa} <span style={{ color: "#334155", fontWeight: 400, fontSize: 10 }}>(CASA)</span>
                      </div>
                      <StatRow label="Campanha" value={ec.record} />
                      <StatRow label="Gols/jogo" value={ec.golsMarcadosPorJogo} sub={`sofridos: ${ec.golsSofridosPorJogo}`} />
                      <StatRow label="Em casa (gols/jogo)" value={ec.golsMarcadosEmCasa} sub={`sofridos: ${ec.golsSofridosEmCasa}`} highlight="#4ADE80" />
                      <StatRow label="xG/jogo" value={ec.xgPorJogo} sub={ec.xgaPorJogo ? `xGA: ${ec.xgaPorJogo}` : undefined} />
                      <StatRow label="Finalizações/jogo" value={ec.finalizacoesPorJogo} />
                      <StatRow label="Posse (%)" value={ec.posse ? `${ec.posse}%` : "—"} />
                      <StatRow label="Nota SofaScore" value={ec.notaMediaSofaScore || "—"} highlight="#FCD34D" />
                      <StatRow label="Rec. em casa" value={ec.emCasa} />
                      <StatRow label="Aproveit. casa" value={`${ec.aproveitamentoCasa || 0}%`} highlight={ec.aproveitamentoCasa >= 55 ? "#4ADE80" : ec.aproveitamentoCasa >= 40 ? "#FCD34D" : "#F87171"} />
                      <StatRow label="BTTS Sim%" value={`${ec.bttsSimPct || 0}%`} />
                      <StatRow label="Escanteios/jogo" value={`${ec.escanteiosFavor || "—"} / ${ec.mediaEscanteiosTotal || "—"} total`} />
                      {ec.estiloJogo && <div style={{ fontSize: 9, color: "#334155", marginTop: 6 }}>🎮 {ec.estiloJogo}</div>}
                    </Card>
                    <Card accent="#1E3A5F">
                      <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: "#60A5FA", fontSize: 12, marginBottom: 10 }}>
                        {jogo.timeVisitante} <span style={{ color: "#334155", fontWeight: 400, fontSize: 10 }}>(FORA)</span>
                      </div>
                      <StatRow label="Campanha" value={ev.record} />
                      <StatRow label="Gols/jogo" value={ev.golsMarcadosPorJogo} sub={`sofridos: ${ev.golsSofridosPorJogo}`} />
                      <StatRow label="Fora (gols/jogo)" value={ev.golsMarcadosFora} sub={`sofridos: ${ev.golsSofridosFora}`} highlight="#60A5FA" />
                      <StatRow label="xG/jogo" value={ev.xgPorJogo} sub={ev.xgaPorJogo ? `xGA: ${ev.xgaPorJogo}` : undefined} />
                      <StatRow label="Finalizações/jogo" value={ev.finalizacoesPorJogo} />
                      <StatRow label="Posse (%)" value={ev.posse ? `${ev.posse}%` : "—"} />
                      <StatRow label="Nota SofaScore" value={ev.notaMediaSofaScore || "—"} highlight="#FCD34D" />
                      <StatRow label="Rec. fora" value={ev.fora} />
                      <StatRow label="Aproveit. fora" value={`${ev.aproveitamentoFora || 0}%`} highlight={ev.aproveitamentoFora >= 55 ? "#4ADE80" : ev.aproveitamentoFora >= 40 ? "#FCD34D" : "#F87171"} />
                      <StatRow label="BTTS Sim%" value={`${ev.bttsSimPct || 0}%`} />
                      <StatRow label="Escanteios/jogo" value={`${ev.escanteiosFavor || "—"} / ${ev.mediaEscanteiosTotal || "—"} total`} />
                      {ev.estiloJogo && <div style={{ fontSize: 9, color: "#334155", marginTop: 6 }}>🎮 {ev.estiloJogo}</div>}
                    </Card>
                  </div>
                </Section>

                {/* Contexto */}
                <Section title="Contexto Situacional & Desfalques" icon="⚙️">
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
                    <Card>
                      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 4, fontSize: 9, color: "#334155", fontWeight: 800, marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid #1A1D24", letterSpacing: "0.05em" }}>
                        <span>FATOR</span>
                        <span style={{ textAlign: "center", color: "#4ADE80" }}>{jogo.timeCasa?.split(" ")[0]?.toUpperCase()}</span>
                        <span style={{ textAlign: "center", color: "#60A5FA" }}>{jogo.timeVisitante?.split(" ")[0]?.toUpperCase()}</span>
                      </div>
                      {ctx.map((c, i) => (
                        <div key={i} style={{ marginBottom: 8 }}>
                          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 4, alignItems: "center", marginBottom: 2 }}>
                            <span style={{ fontSize: 11, color: "#475569" }}>{c.fator}</span>
                            <Score val={c.scoreCasa} />
                            <Score val={c.scoreVisitante} />
                          </div>
                          {c.justificativa && <div style={{ fontSize: 9, color: "#334155", paddingLeft: 2 }}>{c.justificativa}</div>}
                        </div>
                      ))}
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1A1D24", display: "flex", gap: 16, fontSize: 12 }}>
                        <span style={{ color: "#4ADE80", fontWeight: 700 }}>{jogo.timeCasa?.split(" ")[0]}: {totalCasa}/{maxCtx}</span>
                        <span style={{ color: "#60A5FA", fontWeight: 700 }}>{jogo.timeVisitante?.split(" ")[0]}: {totalVisit}/{maxCtx}</span>
                      </div>
                    </Card>
                    <Card>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#F87171", marginBottom: 8 }}>⚠️ DESFALQUES</div>
                      {[
                        { time: jogo.timeCasa, lista: desfalques?.casa, retornos: desfalques?.retornosCasa, impacto: desfalques?.impactoCasa, color: "#4ADE80" },
                        { time: jogo.timeVisitante, lista: desfalques?.visitante, retornos: desfalques?.retornosVisitante, impacto: desfalques?.impactoVisitante, color: "#60A5FA" },
                      ].map(({ time, lista, retornos, impacto, color }, ti) => (
                        <div key={ti} style={{ marginBottom: ti === 0 ? 12 : 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <span style={{ fontSize: 11, color, fontWeight: 700 }}>{time}</span>
                            {impacto && (
                              <span style={{ fontSize: 9, color: IMPACTO_COLOR[impacto], border: `1px solid ${IMPACTO_COLOR[impacto]}40`, padding: "1px 4px", borderRadius: 3, fontWeight: 700 }}>
                                {impacto?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          {(lista || []).length === 0
                            ? <div style={{ fontSize: 11, color: "#334155", marginBottom: 4 }}>Sem baixas confirmadas</div>
                            : (lista || []).map((d, i) => <div key={i} style={{ fontSize: 11, color: "#64748B", marginBottom: 3 }}>✗ {d}</div>)
                          }
                          {(retornos || []).map((r, i) => <div key={i} style={{ fontSize: 11, color: "#4ADE80", marginBottom: 3 }}>✓ {r}</div>)}
                        </div>
                      ))}
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1A1D24" }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: "#FCD34D", marginBottom: 6 }}>📋 H2H</div>
                        <StatRow label="Resumo" value={h2h?.resumo} />
                        <StatRow label="Último jogo" value={h2h?.ultimoJogo} />
                        <StatRow label="Média gols" value={h2h?.mediaGols ? `${h2h.mediaGols}/jogo` : "—"} />
                        <StatRow label="BTTS Sim" value={h2h?.bttsSimPct ? `${h2h.bttsSimPct}%` : "—"} />
                        <StatRow label="Escanteios H2H" value={h2h?.mediaEscanteios || "—"} />
                        <StatRow label="HT/FT + freq." value={h2h?.htFtMaisComum || "—"} />
                        {h2h?.tendencia && <div style={{ fontSize: 10, color: "#334155", marginTop: 6, lineHeight: 1.5 }}>{h2h.tendencia}</div>}
                      </div>
                    </Card>
                  </div>
                </Section>

                {/* Pareamento */}
                {pareamento && (
                  <Section title="Pareamento — SofaScore × PrimaTips" icon="🔗">
                    <Card>
                      {(() => {
                        const status = pareamento?.consenso?.statusConvergencia || "";
                        const isConv = status.includes("CONFIRMADA");
                        const isDivAlta = status.includes("ALTA");
                        const bgColor = isConv ? "#0A2E1A" : isDivAlta ? "#2D0A0A" : "#2D1A00";
                        const borderColor = isConv ? "#166534" : isDivAlta ? "#7F1D1D" : "#78350F";
                        const textColor = isConv ? "#4ADE80" : isDivAlta ? "#F87171" : "#FCD34D";
                        return (
                          <div style={{ background: bgColor, border: `1px solid ${borderColor}`, borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: textColor, marginBottom: 4 }}>{status}</div>
                            <div style={{ fontSize: 11, color: textColor + "99", lineHeight: 1.6 }}>{pareamento?.consenso?.interpretacao}</div>
                          </div>
                        );
                      })()}
                      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 4, fontSize: 9, color: "#334155", fontWeight: 800, marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid #1A1D24" }}>
                        <span>RESULTADO</span>
                        <span style={{ textAlign: "center", color: "#4ADE80" }}>SOFASCORE</span>
                        <span style={{ textAlign: "center", color: "#60A5FA" }}>PRIMATIPS</span>
                        <span style={{ textAlign: "center", color: "#FCD34D" }}>CONSENSO</span>
                      </div>
                      {[
                        { label: `Vitória ${jogo?.timeCasa}`, ss: pareamento?.sofascore?.probVitoriaCasa, pt: pareamento?.primatips?.probVitoriaCasa, con: pareamento?.consenso?.probVitoriaCasa },
                        { label: "Empate", ss: pareamento?.sofascore?.probEmpate, pt: pareamento?.primatips?.probEmpate, con: pareamento?.consenso?.probEmpate },
                        { label: `Vitória ${jogo?.timeVisitante}`, ss: pareamento?.sofascore?.probVitoriaVisitante, pt: pareamento?.primatips?.probVitoriaVisitante, con: pareamento?.consenso?.probVitoriaVisitante },
                      ].map((row, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 4, alignItems: "center", padding: "6px 0", borderBottom: i < 2 ? "1px solid #1A1D2440" : "none" }}>
                          <span style={{ fontSize: 11, color: "#94A3B8" }}>{row.label}</span>
                          <span style={{ textAlign: "center", fontWeight: 700, color: "#4ADE80", fontSize: 12 }}>{row.ss ? `${row.ss}%` : "—"}</span>
                          <span style={{ textAlign: "center", fontWeight: 700, color: "#60A5FA", fontSize: 12 }}>{row.pt ? `${row.pt}%` : "—"}</span>
                          <span style={{ textAlign: "center", fontWeight: 800, color: "#FCD34D", fontSize: 12 }}>{row.con ? `${row.con}%` : "—"}</span>
                        </div>
                      ))}
                    </Card>
                  </Section>
                )}

                {/* Value Bets */}
                <Section title="Value Bet Analysis — Todos os Mercados" icon="💡">
                  <Card>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr", gap: 4, fontSize: 9, color: "#334155", fontWeight: 800, padding: "4px 0 8px", borderBottom: "1px solid #1A1D24", letterSpacing: "0.05em" }}>
                      <span>MERCADO</span><span>P.REAL</span><span>ODD</span><span>P.IMPL.</span><span>EDGE</span><span>KELLY</span><span>SINAL</span>
                    </div>
                    {(valueBets || []).map((b, i) => (
                      <div key={i} style={{
                        display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr", gap: 4,
                        alignItems: "center", fontSize: 11, padding: "6px 0",
                        borderBottom: i < valueBets.length - 1 ? "1px solid #1A1D2460" : "none",
                        background: b.sinal === "APOSTAR" ? "#0A2E1A18" : b.sinal === "EVITAR" ? "#2D0A0A18" : "transparent",
                        borderRadius: 4,
                      }}>
                        <span style={{ color: "#CBD5E1", fontSize: 10 }}>{b.mercado}</span>
                        <span style={{ color: "#94A3B8" }}>{b.probReal}%</span>
                        <span style={{ color: "#94A3B8" }}>{b.oddMercado || "—"}</span>
                        <span style={{ color: "#94A3B8" }}>{b.probImplicita}%</span>
                        <span style={{ fontWeight: 700, color: b.edge > 0 ? "#4ADE80" : b.edge < 0 ? "#F87171" : "#94A3B8" }}>
                          {b.edge > 0 ? "+" : ""}{b.edge}%
                        </span>
                        <span style={{ color: "#64748B", fontSize: 10 }}>{b.kelly > 0 ? `${(b.kelly * 100).toFixed(1)}%` : "—"}</span>
                        <Tag sinal={b.sinal} />
                      </div>
                    ))}
                  </Card>
                </Section>

                {/* Conclusão */}
                {(() => {
                  const v = recomendacao?.veredicto || "NEUTRO";
                  const isPositive = v === "APOSTAR" || v === "VALOR" || v === "LEVE";
                  const isEvitar = v === "EVITAR";
                  const accentColor = isEvitar ? "#7F1D1D" : v === "NEUTRO" ? "#374151" : "#166534";
                  const accentBg = isEvitar ? "#2D0A0A" : v === "NEUTRO" ? "#16181C" : "#0A2E1A";
                  const textColor = isEvitar ? "#F87171" : v === "NEUTRO" ? "#6B7280" : "#4ADE80";
                  return (
                    <Section title="Veredito Final" icon={isEvitar ? "🚫" : v === "NEUTRO" ? "⚖️" : "🎯"}>
                      <div style={{ background: accentBg, border: `1px solid ${accentColor}`, borderRadius: 12, padding: "18px 20px", marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                          <Tag sinal={v} />
                          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 800, color: textColor, flex: 1 }}>
                            {recomendacao?.principal}
                          </div>
                        </div>
                        {isPositive && (
                          <div style={{ display: "flex", gap: 16, fontSize: 11, color: textColor + "CC", marginBottom: 10, flexWrap: "wrap" }}>
                            <span>Mercado: <b style={{ color: textColor }}>{recomendacao?.mercado}</b></span>
                            {recomendacao?.odd > 0 && <span>Odd: <b style={{ color: textColor }}>{recomendacao.odd}</b></span>}
                            <span>Stake: <b style={{ color: textColor }}>{recomendacao?.unidades}</b></span>
                            <span>Confiança: <b style={{ color: textColor }}>{recomendacao?.confianca}%</b></span>
                          </div>
                        )}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                          {(recomendacao?.indicadoresConvergentes || []).length > 0 && (
                            <div>
                              <div style={{ fontSize: 9, fontWeight: 800, color: "#4ADE8099", marginBottom: 5 }}>✓ SUPORTA</div>
                              {recomendacao.indicadoresConvergentes.map((ind, i) => (
                                <div key={i} style={{ fontSize: 10, color: "#4ADE8066", marginBottom: 3 }}>• {ind}</div>
                              ))}
                            </div>
                          )}
                          {(recomendacao?.indicadoresDivergentes || []).length > 0 && (
                            <div>
                              <div style={{ fontSize: 9, fontWeight: 800, color: "#F87171AA", marginBottom: 5 }}>✗ RISCOS</div>
                              {recomendacao.indicadoresDivergentes.map((ind, i) => (
                                <div key={i} style={{ fontSize: 10, color: "#F8717166", marginBottom: 3 }}>• {ind}</div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: textColor + "80", lineHeight: 1.8, borderTop: `1px solid ${accentColor}40`, paddingTop: 10 }}>
                          {recomendacao?.narrativa}
                        </div>
                      </div>
                      {recomendacao?.alertas?.length > 0 && (
                        <Card accent="#7F1D1D" style={{ background: "#2D0A0A10" }}>
                          <div style={{ fontSize: 10, fontWeight: 800, color: "#F87171", marginBottom: 6 }}>⚠️ ALERTAS</div>
                          {recomendacao.alertas.map((a, i) => (
                            <div key={i} style={{ fontSize: 11, color: "#FCA5A5", marginBottom: 3 }}>• {a}</div>
                          ))}
                        </Card>
                      )}
                    </Section>
                  );
                })()}
              </>
            )}

            {/* TAB: GOLS & OVER/UNDER */}
            {activeTab === "goals" && (
              <>
                <Section title="Modelo Poisson — Gols" icon="🧮">
                  <Card>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid #1A1D24" }}>
                      {[
                        { label: `λ ${jogo.timeCasa}`, value: poisson?.lambdaCasa, color: "#4ADE80" },
                        { label: `λ ${jogo.timeVisitante}`, value: poisson?.lambdaVisitante, color: "#60A5FA" },
                        { label: "1º Placar", value: poisson?.placarMaisProvavel, color: "#FCD34D" },
                        { label: "2º Placar", value: poisson?.placarSegundo, color: "#94A3B8" },
                      ].map((item, i) => (
                        <div key={i} style={{ textAlign: "center", background: "#070A0F", borderRadius: 8, padding: "10px 6px", border: "1px solid #1A1D24" }}>
                          <div style={{ fontSize: 9, color: "#334155", marginBottom: 3 }}>{item.label}</div>
                          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: item.color }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                    <ProbBar label={`Vitória ${jogo.timeCasa}`} prob={poisson?.probVitoriaCasa} color="#4ADE80" />
                    <ProbBar label="Empate" prob={poisson?.probEmpate} color="#64748B" />
                    <ProbBar label={`Vitória ${jogo.timeVisitante}`} prob={poisson?.probVitoriaVisitante} color="#60A5FA" />
                  </Card>
                </Section>

                {/* BTTS */}
                <Section title="BTTS — Ambas Marcam?" icon="⚽⚽">
                  <Card>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div style={{ textAlign: "center", background: "#0A2E1A", borderRadius: 8, padding: "16px", border: "1px solid #166534" }}>
                        <div style={{ fontSize: 9, color: "#4ADE80", fontWeight: 800, marginBottom: 6 }}>BTTS SIM</div>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: "#4ADE80" }}>{poisson?.probBttsSim}%</div>
                        {odds?.bttsSimOdd && <div style={{ fontSize: 11, color: "#4ADE8099", marginTop: 4 }}>Odd: {odds.bttsSimOdd}</div>}
                      </div>
                      <div style={{ textAlign: "center", background: "#2D0A0A", borderRadius: 8, padding: "16px", border: "1px solid #7F1D1D" }}>
                        <div style={{ fontSize: 9, color: "#F87171", fontWeight: 800, marginBottom: 6 }}>BTTS NÃO</div>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: "#F87171" }}>{poisson?.probBttsNao}%</div>
                        {odds?.bttsNaoOdd && <div style={{ fontSize: 11, color: "#F8717199", marginTop: 4 }}>Odd: {odds.bttsNaoOdd}</div>}
                      </div>
                    </div>
                    {poisson?.tendenciaBtts && (
                      <div style={{ textAlign: "center", fontSize: 11, fontWeight: 800, color: poisson.tendenciaBtts.includes("FORTE") ? (poisson.tendenciaBtts.includes("SIM") ? "#4ADE80" : "#F87171") : "#FCD34D", letterSpacing: "0.08em" }}>
                        Tendência: {poisson.tendenciaBtts?.replace(/_/g, " ")}
                      </div>
                    )}
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #1A1D24", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 9, color: "#334155", fontWeight: 800, marginBottom: 6 }}>BTTS HISTÓRICO — {jogo.timeCasa}</div>
                        <StatRow label="BTTS Sim%" value={`${ec.bttsSimPct || 0}%`} />
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: "#334155", fontWeight: 800, marginBottom: 6 }}>BTTS HISTÓRICO — {jogo.timeVisitante}</div>
                        <StatRow label="BTTS Sim%" value={`${ev.bttsSimPct || 0}%`} />
                      </div>
                    </div>
                    <StatRow label="BTTS Sim% H2H" value={`${h2h?.bttsSimPct || 0}%`} />
                  </Card>
                </Section>

                {/* Over/Under expandido */}
                <Section title="Over / Under — 0.5 até 6.5 Gols" icon="📈">
                  <Card>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 14 }}>
                      {[
                        { line: "0.5", over: poisson?.probOver05, under: poisson?.probUnder05 },
                        { line: "1.5", over: poisson?.probOver15, under: poisson?.probUnder15 },
                        { line: "2.5", over: poisson?.probOver25, under: poisson?.probUnder25 },
                        { line: "3.5", over: poisson?.probOver35, under: poisson?.probUnder35 },
                        { line: "4.5", over: poisson?.probOver45, under: poisson?.probUnder45 },
                        { line: "5.5", over: poisson?.probOver55, under: poisson?.probUnder55 },
                        { line: "6.5", over: poisson?.probOver65, under: poisson?.probUnder65 },
                      ].map((item, i) => {
                        const overVal = item.over || 0;
                        const underVal = item.under || (100 - overVal);
                        const overDominates = overVal > 60;
                        const underDominates = underVal > 60;
                        return (
                          <div key={i} style={{ textAlign: "center", background: "#070A0F", borderRadius: 8, padding: "8px 4px", border: `1px solid ${overDominates ? "#166534" : underDominates ? "#1E3A5F" : "#1A1D24"}` }}>
                            <div style={{ fontSize: 9, color: "#334155", marginBottom: 4, fontWeight: 800 }}>±{item.line}</div>
                            <div style={{ fontSize: 9, color: "#334155", marginBottom: 2 }}>OVER</div>
                            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: overVal >= 70 ? "#4ADE80" : overVal >= 50 ? "#FCD34D" : "#F87171" }}>
                              {overVal}%
                            </div>
                            <div style={{ fontSize: 9, color: "#334155", margin: "4px 0 2px" }}>UNDER</div>
                            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: underVal >= 70 ? "#60A5FA" : underVal >= 50 ? "#FCD34D" : "#94A3B8" }}>
                              {underVal}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {odds && (
                      <div style={{ borderTop: "1px solid #1A1D24", paddingTop: 10, display: "flex", gap: 12, flexWrap: "wrap", fontSize: 11 }}>
                        {[
                          { label: "Over 0.5", val: odds.over05 }, { label: "Over 1.5", val: odds.over15 },
                          { label: "Over 2.5", val: odds.over25 }, { label: "Over 3.5", val: odds.over35 },
                          { label: "Over 4.5", val: odds.over45 }, { label: "Under 1.5", val: odds.under15 },
                          { label: "Under 2.5", val: odds.under25 }, { label: "Under 3.5", val: odds.under35 },
                        ].filter(i => i.val).map((item, i) => (
                          <span key={i}><span style={{ color: "#475569" }}>{item.label}: </span><b style={{ color: "#CBD5E1" }}>{item.val}</b></span>
                        ))}
                      </div>
                    )}
                  </Card>
                </Section>
              </>
            )}

            {/* TAB: HT/FT */}
            {activeTab === "htft" && htFt && (
              <Section title="Resultado Intervalo / Final (HT/FT)" icon="🔄">
                <div style={{ background: "#0A1520", border: "1px solid #1E3A5F", borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "#60A5FA", lineHeight: 1.6, marginBottom: 8 }}>
                    <b>Top HT/FT:</b> {htFt.topHtFt}
                  </div>
                  {htFt.padraoVirada && (
                    <div style={{ fontSize: 10, color: "#94A3B8" }}>{htFt.padraoVirada}</div>
                  )}
                </div>
                <Card>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {(htFt.combinacoes || []).map((combo, i) => {
                      const c = TAG_COLORS[combo.sinal] || TAG_COLORS.NEUTRO;
                      const isTop = combo.prob >= 20;
                      return (
                        <div key={i} style={{
                          textAlign: "center", background: isTop ? "#0A2E1A" : "#070A0F",
                          borderRadius: 8, padding: "10px 8px",
                          border: `1px solid ${isTop ? "#166534" : "#1A1D24"}`
                        }}>
                          <div style={{ fontSize: 10, color: "#94A3B8", marginBottom: 4, fontWeight: 600 }}>{combo.resultado}</div>
                          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: isTop ? "#4ADE80" : "#64748B", marginBottom: 3 }}>
                            {combo.prob}%
                          </div>
                          {combo.oddEstimada > 0 && (
                            <div style={{ fontSize: 10, color: "#334155", marginBottom: 4 }}>Odd ≈ {combo.oddEstimada}</div>
                          )}
                          <Tag sinal={combo.sinal || "NEUTRO"} />
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </Section>
            )}

            {/* TAB: ESCANTEIOS */}
            {activeTab === "corners" && escanteios && (
              <Section title="Escanteios — Over / Under" icon="🚩">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                  <Card>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 9, color: "#334155", marginBottom: 3 }}>Média {jogo.timeCasa}</div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#4ADE80" }}>{escanteios.mediaEscanteiosCasa}</div>
                    </div>
                  </Card>
                  <Card>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 9, color: "#334155", marginBottom: 3 }}>λ Total</div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#FCD34D" }}>{escanteios.lambdaEscanteios}</div>
                    </div>
                  </Card>
                  <Card>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 9, color: "#334155", marginBottom: 3 }}>Média {jogo.timeVisitante}</div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#60A5FA" }}>{escanteios.mediaEscanteiosVisitante}</div>
                    </div>
                  </Card>
                </div>
                <Card>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 12 }}>
                    {[
                      { line: "7.5", over: escanteios.over75Pct, under: escanteios.under75Pct },
                      { line: "8.5", over: escanteios.over85Pct, under: escanteios.under85Pct },
                      { line: "9.5", over: escanteios.over95Pct, under: escanteios.under95Pct },
                      { line: "10.5", over: escanteios.over105Pct, under: escanteios.under105Pct },
                      { line: "11.5", over: escanteios.over115Pct },
                    ].map((item, i) => (
                      <div key={i} style={{ textAlign: "center", background: "#070A0F", borderRadius: 8, padding: "10px 4px", border: "1px solid #1A1D24" }}>
                        <div style={{ fontSize: 9, color: "#334155", marginBottom: 3, fontWeight: 800 }}>±{item.line}</div>
                        <div style={{ fontSize: 9, color: "#4ADE80AA", marginBottom: 1 }}>OVER</div>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: (item.over || 0) >= 60 ? "#4ADE80" : "#94A3B8" }}>
                          {item.over || "—"}%
                        </div>
                        {item.under && (
                          <>
                            <div style={{ fontSize: 9, color: "#60A5FAAA", margin: "3px 0 1px" }}>UNDER</div>
                            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: (item.under || 0) >= 60 ? "#60A5FA" : "#94A3B8" }}>
                              {item.under}%
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  {escanteios.melhorLinhaEscanteios && (
                    <div style={{ background: "#0A2E1A", border: "1px solid #166534", borderRadius: 8, padding: "10px 12px" }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: "#4ADE80" }}>💡 Melhor linha: {escanteios.melhorLinhaEscanteios} ({escanteios.melhorLinhaProb}%)</span>
                      {escanteios.justificativa && <div style={{ fontSize: 10, color: "#4ADE8099", marginTop: 4 }}>{escanteios.justificativa}</div>}
                    </div>
                  )}
                  {odds && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1A1D24", display: "flex", gap: 12, flexWrap: "wrap", fontSize: 11 }}>
                      {[
                        { label: "Escanteios O8.5", val: odds.escanteiosOver85 },
                        { label: "Escanteios O9.5", val: odds.escanteiosOver95 },
                        { label: "Escanteios O10.5", val: odds.escanteiosOver105 },
                      ].filter(i => i.val).map((item, i) => (
                        <span key={i}><span style={{ color: "#475569" }}>{item.label}: </span><b>{item.val}</b></span>
                      ))}
                    </div>
                  )}
                </Card>
              </Section>
            )}

            {/* TAB: CARTÕES */}
            {activeTab === "cards" && cartoes && (
              <Section title="Mercado de Cartões" icon="🟨">
                <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <Card>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#FCD34D", marginBottom: 10 }}>📊 ESTATÍSTICAS</div>
                      <StatRow label={`Cartões/jogo — ${jogo.timeCasa}`} value={cartoes.mediaCasa} highlight="#FCD34D" />
                      <StatRow label={`Cartões/jogo — ${jogo.timeVisitante}`} value={cartoes.mediaVisitante} highlight="#FCD34D" />
                      <StatRow label="Projeção jogo" value={cartoes.mediaJogo} highlight="#F1F5F9" />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginTop: 12 }}>
                        {[
                          { label: "Over 2.5", pct: cartoes.over25CartoesPct },
                          { label: "Over 3.5", pct: cartoes.over35CartoesPct, odd: cartoes.oddOver35Cartoes },
                          { label: "Over 4.5", pct: cartoes.over45CartoesPct, odd: cartoes.oddOver45Cartoes },
                          { label: "Over 5.5", pct: cartoes.over55CartoesPct },
                        ].map((item, i) => (
                          <div key={i} style={{ textAlign: "center", background: "#070A0F", borderRadius: 6, padding: "8px 4px", border: "1px solid #1A1D24" }}>
                            <div style={{ fontSize: 9, color: "#334155", marginBottom: 3 }}>{item.label}</div>
                            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: (item.pct || 0) >= 60 ? "#FCD34D" : "#475569" }}>
                              {item.pct || 0}%
                            </div>
                            {item.odd && <div style={{ fontSize: 9, color: "#334155", marginTop: 2 }}>odd {item.odd}</div>}
                          </div>
                        ))}
                      </div>
                    </Card>
                    {cartoes.arbitro?.nome && (
                      <Card accent="#2D1A00">
                        <div style={{ fontSize: 10, fontWeight: 800, color: "#FCD34D", marginBottom: 8 }}>🏁 ÁRBITRO: {cartoes.arbitro.nome}</div>
                        <StatRow label="Média cartões/jogo" value={cartoes.arbitro.mediaCartoesPorJogo} highlight="#FCD34D" />
                        <StatRow label="Média amarelos" value={cartoes.arbitro.mediaAmarelos} />
                        <StatRow label="Média vermelhos" value={cartoes.arbitro.mediaVermelhos} />
                        {cartoes.arbitro.tendenciaRigido && (
                          <div style={{ marginTop: 8, fontSize: 10, color: "#F87171", fontWeight: 700, background: "#2D0A0A", borderRadius: 5, padding: "4px 8px", textAlign: "center" }}>
                            ⚠️ Árbitro RÍGIDO — fator ×1.2 aplicado
                          </div>
                        )}
                      </Card>
                    )}
                    {cartoes.recomendacaoCartoes && (
                      <div style={{ background: "#2D1A00", border: "1px solid #78350F", borderRadius: 10, padding: "10px 14px", fontSize: 11, color: "#D97706", lineHeight: 1.6 }}>
                        💡 {cartoes.recomendacaoCartoes}
                      </div>
                    )}
                  </div>
                  <Card>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#F87171", marginBottom: 10 }}>🟨 JOGADORES EM RISCO</div>
                    <div style={{ display: "grid", gridTemplateColumns: "6fr 1fr 1fr 1fr 1fr", gap: 4, fontSize: 9, color: "#334155", fontWeight: 800, marginBottom: 6, paddingBottom: 5, borderBottom: "1px solid #1A1D24" }}>
                      <span>JOGADOR</span><span>AM/J</span><span>PROB</span><span>ODD</span><span>SINAL</span>
                    </div>
                    {(cartoes.jogadoresRisco || []).length === 0 && (
                      <div style={{ fontSize: 11, color: "#334155", textAlign: "center", padding: "16px 0" }}>Dados não disponíveis</div>
                    )}
                    {(cartoes.jogadoresRisco || []).map((j, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "6fr 1fr 1fr 1fr 1fr", gap: 4, alignItems: "center", fontSize: 11, padding: "6px 0", borderBottom: i < cartoes.jogadoresRisco.length - 1 ? "1px solid #1A1D2440" : "none" }}>
                        <div>
                          <div style={{ color: "#F1F5F9", fontWeight: 600 }}>{j.nome}</div>
                          <div style={{ fontSize: 9, color: j.time === "Casa" ? "#4ADE80" : "#60A5FA" }}>{j.time}</div>
                          {j.acumulado && <div style={{ fontSize: 8, color: "#FCD34D", fontWeight: 700 }}>⚠ ACUMULADO</div>}
                          {j.suspensoProxJogo && <div style={{ fontSize: 8, color: "#F87171", fontWeight: 700 }}>RISCO SUSPENSÃO</div>}
                        </div>
                        <span style={{ color: j.amareloPorJogo >= 0.4 ? "#F87171" : "#94A3B8", fontWeight: 700 }}>{j.amareloPorJogo}</span>
                        <span style={{ color: j.probAmareloJogo >= 40 ? "#FCD34D" : "#64748B", fontWeight: 700 }}>{j.probAmareloJogo}%</span>
                        <span style={{ color: "#CBD5E1" }}>{j.odd > 0 ? j.odd : "—"}</span>
                        <Tag sinal={j.sinal} />
                      </div>
                    ))}
                  </Card>
                </div>
              </Section>
            )}

            {/* TAB: JOGADORES */}
            {activeTab === "players" && finalizacoes && (
              <Section title="Finalizações por Jogador" icon="🎯">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { time: jogo.timeCasa, lista: finalizacoes.jogadoresCasa, media: finalizacoes.mediaFinalCasa, color: "#4ADE80", accent: "#166534" },
                    { time: jogo.timeVisitante, lista: finalizacoes.jogadoresVisitante, media: finalizacoes.mediaFinalVisitante, color: "#60A5FA", accent: "#1E3A5F" },
                  ].map(({ time, lista, media, color, accent }) => (
                    <Card key={time} accent={accent}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color }}>{time}</span>
                        <span style={{ fontSize: 9, color: "#334155" }}>Média: <b style={{ color }}>{media} fin/j</b></span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "7fr 1fr 1fr 1fr 1fr 1fr 1fr", gap: 4, fontSize: 9, color: "#334155", fontWeight: 800, marginBottom: 6, paddingBottom: 5, borderBottom: "1px solid #1A1D24" }}>
                        <span>JOGADOR</span><span>FIN/J</span><span>xG/J</span><span>1+</span><span>2+</span><span>ODD1</span><span>SINAL</span>
                      </div>
                      {(lista || []).map((j, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "7fr 1fr 1fr 1fr 1fr 1fr 1fr", gap: 4, alignItems: "center", fontSize: 11, padding: "5px 0", borderBottom: i < lista.length - 1 ? "1px solid #1A1D2440" : "none" }}>
                          <div>
                            {j.rankingFinalizacoes === 1 && <span style={{ fontSize: 8, color: "#FCD34D", marginRight: 3, border: "1px solid #78350F", padding: "1px 3px", borderRadius: 3 }}>#1</span>}
                            <span style={{ color: j.titular ? "#F1F5F9" : "#64748B" }}>{j.nome}</span>
                            {!j.titular && <span style={{ fontSize: 8, color: "#7F1D1D", marginLeft: 3 }}>SUB</span>}
                          </div>
                          <span style={{ color: j.finalizacoesPorJogo >= 2 ? color : "#94A3B8", fontWeight: 700 }}>{j.finalizacoesPorJogo}</span>
                          <span style={{ color: "#64748B" }}>{j.xgPorJogo}</span>
                          <span style={{ color: (j.prob1MaisChute || 0) >= 60 ? color : "#94A3B8", fontWeight: 700 }}>{j.prob1MaisChute || 0}%</span>
                          <span style={{ color: (j.prob2MaisChutes || 0) >= 40 ? color : "#94A3B8" }}>{j.prob2MaisChutes || 0}%</span>
                          <span style={{ color: "#CBD5E1" }}>{j.odd1MaisChute > 0 ? j.odd1MaisChute : "—"}</span>
                          <Tag sinal={j.sinalFinal} />
                        </div>
                      ))}
                      {(lista || []).length === 0 && (
                        <div style={{ fontSize: 11, color: "#334155", textAlign: "center", padding: "10px 0" }}>Dados não disponíveis</div>
                      )}
                      {(lista || []).filter(j => j.observacao).map((j, i) => (
                        <div key={i} style={{ fontSize: 9, color: "#475569", lineHeight: 1.5, marginTop: 4 }}>
                          <span style={{ color, fontWeight: 700 }}>{j.nome}: </span>{j.observacao}
                        </div>
                      ))}
                    </Card>
                  ))}
                </div>
              </Section>
            )}

            {/* TAB: TOP 2 APOSTAS (detalhado) */}
            {activeTab === "top2" && top2Apostas && (
              <Section title="TOP 2 APOSTAS — Análise Detalhada" icon="🏆">
                {top2Apostas.map((ap, i) => {
                  const isMain = i === 0;
                  const textColor = isMain ? "#4ADE80" : "#60A5FA";
                  const borderColor = isMain ? "#166534" : "#1E3A5F";
                  const bgColor = isMain ? "#0A2E1A" : "#0C1424";
                  return (
                    <div key={i} style={{ background: bgColor, border: `2px solid ${borderColor}`, borderRadius: 14, padding: "20px 20px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(to right, ${textColor}, ${borderColor})` }} />
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: textColor }}>
                          {isMain ? "★ APOSTA #1" : "★ APOSTA #2"}
                        </div>
                        <Tag sinal={ap.sinal} />
                      </div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "#F1F5F9", marginBottom: 10 }}>
                        {ap.mercado}
                      </div>
                      <div style={{ display: "flex", gap: 20, fontSize: 12, marginBottom: 14, flexWrap: "wrap", paddingBottom: 12, borderBottom: `1px solid ${borderColor}60` }}>
                        <span>Odd: <b style={{ color: textColor, fontSize: 16 }}>{ap.odd}</b></span>
                        <span>Prob. Real: <b style={{ color: "#FCD34D" }}>{ap.probReal}%</b></span>
                        <span>Prob. Impl.: <b style={{ color: "#94A3B8" }}>{ap.probImplicita}%</b></span>
                        <span>Edge: <b style={{ color: ap.edge > 0 ? "#4ADE80" : "#F87171", fontSize: 14 }}>{ap.edge > 0 ? "+" : ""}{ap.edge}%</b></span>
                        <span>Confiança: <b style={{ color: ap.confianca >= 65 ? "#4ADE80" : "#FCD34D" }}>{ap.confianca}%</b></span>
                        <span>Stake: <b style={{ color: textColor }}>{ap.unidades}</b></span>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: textColor, marginBottom: 6, letterSpacing: "0.08em" }}>
                          POR QUE ESTE MERCADO COMBINA COM ESTES 2 TIMES?
                        </div>
                        <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.8 }}>{ap.porQueEsseMercado}</div>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: textColor, marginBottom: 6, letterSpacing: "0.08em" }}>
                          DADOS QUE EMBASAM
                        </div>
                        {(ap.dadosQueEmbasam || []).map((d, di) => (
                          <div key={di} style={{ fontSize: 11, color: "#64748B", marginBottom: 5, display: "flex", alignItems: "flex-start", gap: 6, lineHeight: 1.5 }}>
                            <span style={{ color: textColor, fontWeight: 700 }}>▸</span> {d}
                          </div>
                        ))}
                      </div>
                      {ap.padraoCombinado && (
                        <div style={{ marginBottom: 12, background: "#07090E", borderRadius: 8, padding: "10px 12px", border: `1px solid ${borderColor}40` }}>
                          <div style={{ fontSize: 10, fontWeight: 800, color: "#334155", marginBottom: 4 }}>PADRÃO OFENSIVO/DEFENSIVO</div>
                          <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.6 }}>{ap.padraoCombinado}</div>
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                        {ap.h2hSuporta !== undefined && (
                          <span style={{ fontSize: 10, color: ap.h2hSuporta ? "#4ADE80" : "#F87171", fontWeight: 700 }}>
                            {ap.h2hSuporta ? "✓" : "✗"} H2H {ap.h2hSuporta ? "suporta" : "não suporta"}
                          </span>
                        )}
                        {ap.contextoSuporta !== undefined && (
                          <span style={{ fontSize: 10, color: ap.contextoSuporta ? "#4ADE80" : "#F87171", fontWeight: 700 }}>
                            {ap.contextoSuporta ? "✓" : "✗"} Contexto {ap.contextoSuporta ? "suporta" : "não suporta"}
                          </span>
                        )}
                      </div>
                      {ap.principalRisco && (
                        <div style={{ background: "#2D0A0A40", border: "1px solid #7F1D1D60", borderRadius: 8, padding: "10px 12px" }}>
                          <div style={{ fontSize: 10, fontWeight: 800, color: "#F87171", marginBottom: 4 }}>⚠️ PRINCIPAL RISCO</div>
                          <div style={{ fontSize: 11, color: "#FCA5A5", lineHeight: 1.5 }}>{ap.principalRisco}</div>
                        </div>
                      )}
                      {(ap.alertas || []).length > 0 && (
                        <div style={{ marginTop: 10 }}>
                          {ap.alertas.map((a, ai) => (
                            <div key={ai} style={{ fontSize: 10, color: "#D97706", marginBottom: 3 }}>⚡ {a}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </Section>
            )}

            <div style={{ textAlign: "center", fontSize: 9, color: "#1A1D24", marginTop: 24, letterSpacing: "0.08em" }}>
              SOFASCORE + PRIMATIPS + POISSON · MENTOR CONCISO v5 · ANÁLISE CLAUDE AI · APOSTE COM RESPONSABILIDADE · +18
            </div>
          </div>
        );
      })()}
    </div>
  );
}
