# Sentinel

> O objetivo do Sentinel é antecipar risco clínico, operacional e financeiro em tempo útil para mudar condutas, organizar a jornada assistencial e reduzir desperdício. A IA deve funcionar como camada de apoio à decisão, monitoramento e priorização, sem substituir julgamento médico ou protocolos institucionais.

## Visão

Em um plano de saúde verticalizado, a IA preditiva pode atuar em todas as camadas da operação:

- **Pronto-socorro:** risco de deterioração, necessidade de internação, UTI, retorno precoce, tempo de permanência, uso de exames e eventos adversos.
- **Ambulatório:** progressão de doenças crônicas, descompensação evitável, adesão terapêutica, necessidade de consulta antecipada e priorização de cuidado coordenado.
- **Internação:** risco de UTI, longa permanência, reinternação, infecção, delirium, queda, eventos tromboembólicos, mortalidade e custo do episódio.
- **Medicina preventiva:** rastreamento personalizado, risco cardiovascular, fragilidade, sarcopenia, declínio cognitivo, perda funcional e evitabilidade de eventos.
- **Home care e transição de cuidado:** risco de readmissão, necessidade de visita, falha de seguimento, escalonamento para atendimento presencial e elegibilidade para programas.
- **Operação assistencial:** previsão de demanda, ocupação, fluxo de PS, fila de exames, agenda ambulatorial, absenteísmo e alocação de equipe.
- **Gestão econômica:** custo esperado por episódio, custo evitável, variação injustificada de prática, desperdício diagnóstico-terapêutico e impacto de intervenções.
- **Qualidade e segurança:** detecção precoce de eventos sentinela, desvios de protocolo, pacientes sem plano de cuidado adequado e riscos subnotificados.

## Princípios

- Predizer apenas desfechos acionáveis: se o alerta não muda fluxo, conduta, prioridade ou acompanhamento, ele não deve ser priorizado.
- Medir benefício clínico e econômico em conjunto: um modelo útil precisa melhorar cuidado, reduzir dano ou reduzir custo evitável.
- Começar com dados mais estruturados e disponíveis antes de usar modalidades complexas.
- Adicionar complexidade em camadas, medindo ganho incremental de AUC, calibração e utilidade clínica.
- Tratar a imagem como hipótese testável em diferentes momentos do pipeline, não como etapa obrigatoriamente final.
- Separar ordem de experimentação, ordem de implantação e disponibilidade temporal dos dados.
- Validar desempenho por subgrupos relevantes: idade, sexo, unidade, comorbidades, fragilidade, horários, médico/equipe e linhas de cuidado.
- Manter governança de LGPD, rastreabilidade, auditoria, explicabilidade proporcional ao risco e monitoramento de drift.

## Primeira prova de conceito

### Contexto

A primeira POC será disparada quando um paciente chegar ao pronto-socorro e realizar uma TC de crânio.

Esse ponto da jornada é estratégico porque concentra pacientes idosos ou fragilizados, sintomas neurológicos, quedas, anticoagulação, cefaleia, síncope, rebaixamento de consciência e suspeitas de AVC ou sangramento intracraniano. Também envolve alto custo potencial por internação, UTI, repetição de exames, atraso diagnóstico e falha de transição de cuidado.

### Pergunta central

Dado um paciente no PS que realizou TC de crânio, qual é o risco de desfechos clínicos e econômicos relevantes nas próximas horas, dias e semanas?

O modelo deve gerar escores de risco em janelas temporais claras:

- **0 a 6 horas:** deterioração, transferência, prioridade de avaliação, necessidade de protocolo neurológico ou monitorização.
- **6 a 24 horas:** internação, UTI, reavaliação, repetição de exame, evento neurológico agudo.
- **24 a 72 horas:** alta insegura, retorno precoce ao PS, piora clínica, necessidade de novo atendimento.
- **7 a 30 dias:** reinternação, custo do episódio, mortalidade, nova imagem, seguimento ambulatorial crítico.

## Desfechos candidatos

Os desfechos abaixo devem ser avaliados por dois critérios: impacto no cuidado do paciente e economia potencial para o plano.

| Prioridade | Desfecho | Janela | Valor para o paciente | Valor para o plano | Observações |
| --- | --- | --- | --- | --- | --- |
| 1 | Necessidade de internação hospitalar | 24h | Evita alta insegura e organiza fluxo precoce | Reduz permanência improdutiva no PS e melhora uso de leitos | Geralmente bem estruturado e fácil de rotular |
| 1 | Necessidade de UTI ou sala crítica | 6-24h | Antecipa deterioração e monitorização | Evita eventos graves, transferência tardia e custo por complicação | Alto impacto, menor prevalência; exige boa calibração |
| 1 | Retorno ao PS após alta | 72h e 7d | Identifica alta com risco de falha | Reduz atendimento repetido e custo evitável | Bom desfecho para intervenções de transição |
| 1 | Mortalidade | 7d e 30d | Sinaliza risco extremo e necessidade de cuidado intensivo/paliativo adequado | Evita escalonamento tardio e melhora planejamento | Evento raro; pode ser combinado com desfecho composto |
| 2 | Achado neurológico agudo relevante no laudo | Durante episódio | Acelera priorização e linha de cuidado | Reduz atraso, repetição e variação de conduta | Pode ser treinado com NLP do laudo antes da análise dos pixels |
| 2 | Necessidade de avaliação neurológica/neurocirúrgica | 24h | Direciona especialista correto | Evita chamadas tardias e transferências desnecessárias | Rótulo depende de dados de solicitação/parecer |
| 2 | Repetição de TC/RM ou exame complementar | 72h | Pode indicar incerteza diagnóstica ou piora | Reduz redundância e custo evitável | Usar com cuidado: repetição pode ser adequada |
| 2 | Longa permanência no PS | 12-24h | Reduz espera e risco de desassistência | Melhora giro, capacidade e custo operacional | Muito acionável para gestão de fluxo |
| 2 | Custo total do episódio | 7d e 30d | Proxy de complexidade e intensidade assistencial | Apoia gestão de recurso e intervenção precoce | Tratar como regressão ou risco de alto custo |
| 3 | Reinternação hospitalar | 30d | Melhora continuidade e plano pós-alta | Reduz custo recorrente e falha de cuidado | Mais distante do evento inicial |
| 3 | Declínio funcional ou necessidade de home care | 30d | Protege autonomia e cuidado longitudinal | Evita reinternação e cuidado tardio caro | Pode exigir dados menos estruturados |

### Desfechos a testar primeiro

Para a primeira rodada, a recomendação é testar modelos nessa ordem:

1. **Internação hospitalar em até 24h**
   - Alta disponibilidade de rótulo.
   - Forte impacto operacional.
   - Bom ponto de partida para validar pipeline, coorte, features temporais e calibração.

2. **UTI, sala crítica ou deterioração clínica em até 24h**
   - Maior impacto assistencial.
   - Pode reduzir atraso em pacientes de alto risco.
   - Deve ser avaliado com sensibilidade alta e baixa tolerância a falso negativo.

3. **Retorno ao PS em 72h ou 7 dias após alta**
   - Desfecho diretamente ligado à qualidade de alta e transição de cuidado.
   - Bom alvo para intervenções de ligação ativa, consulta precoce ou reavaliação.

4. **Custo alto do episódio em 7 ou 30 dias**
   - Traduz risco em impacto econômico.
   - Deve ser usado junto com desfechos clínicos, não isoladamente.

5. **Mortalidade, UTI ou internação como desfecho composto**
   - Aumenta frequência de evento para modelagem inicial.
   - Captura risco clínico grave quando eventos individuais forem raros.

## Camadas de dados e treinamentos consecutivos

A evolução dos modelos deve seguir uma lógica incremental, mas não precisa impor uma ordem única para todos os experimentos. Cada camada só deve ser mantida se melhorar desempenho, calibração, utilidade clínica, antecipação operacional ou capacidade de ação.

Como a realização da TC de crânio é o gatilho da POC, o exame deve entrar cedo no pipeline como evento estruturado e metadado operacional. A análise dos pixels/volume por CNN 3D pode ser testada em diferentes momentos, inclusive como entrada pura no momento em que o exame fica disponível. O ponto metodológico é medir o valor de cada combinação contra baselines justos e contra o melhor modelo disponível naquele momento da jornada.

### Camada 0: coorte, tempo zero e rótulos

Definir antes de treinar:

- Tempo zero: horário da chegada ao PS, horário da solicitação da TC ou horário de realização da TC.
- Inclusão: pacientes do PS com TC de crânio no episódio.
- Exclusão: exames eletivos, pacientes já internados antes da TC, duplicidades do mesmo episódio e casos sem rastreabilidade de desfecho.
- Rótulos: internação, UTI, retorno, mortalidade, custo, repetição de exame, parecer especialista.
- Janelas temporais fixas: 6h, 24h, 72h, 7d e 30d.

Essa camada não é um modelo; é a base de verdade. Sem ela, AUC alta pode refletir vazamento de informação ou definição incorreta de desfecho.

### Camada 1: dados administrativos e cadastrais

Primeira camada preditiva por facilidade e disponibilidade:

- Idade, sexo, unidade, data/hora, dia da semana e turno.
- Tipo de chegada, origem, elegibilidade, plano/produto, tempo de relacionamento.
- Histórico de utilização: PS nos últimos 30/90/180 dias, internações prévias, UTI prévia, exames recentes.
- Custo histórico e perfil de alto utilizador.

Uso esperado: baseline robusto para internação, retorno, custo e permanência.

### Camada 2: dados estruturados do episódio de PS

Adicionar variáveis do atendimento atual:

- Queixa principal e classificação de risco.
- Sinais vitais iniciais e piores sinais vitais até a TC.
- Glasgow, dor, febre, pressão arterial, saturação, glicemia capilar, queda, síncope, cefaleia, déficit neurológico.
- Medicações administradas no PS.
- Tempos: chegada-triagem, triagem-médico, médico-TC, TC-laudo, decisão-alta/internação.

Uso esperado: melhora para UTI, deterioração e longa permanência.

### Camada 3: evento da TC e metadados DICOM

Adicionar a camada "pré-imagem", sem análise de pixels:

- Confirmação do exame: TC de crânio, com ou sem contraste, unidade, equipamento e protocolo.
- Horários: solicitação, início da aquisição, conclusão, chegada ao PACS/VNA, disponibilização e assinatura do laudo.
- Metadados DICOM: modalidade, descrição do estudo, descrição da série, espessura de corte, número de instâncias, orientação, contraste e tags de qualidade disponíveis.
- Seleção da série candidata para uso futuro: axial, primary/original, sem reconstruções secundárias inadequadas, com número de cortes compatível.
- Indicadores operacionais: atraso entre solicitação e aquisição, atraso entre aquisição e laudo, exame repetido, exame incompleto, artefato documentado.

Uso esperado: melhora para fluxo de PS, priorização operacional, custo, tempo até decisão e preparação da etapa multimodal. Essa camada também reduz fricção porque usa dados já presentes no fluxo DICOM/PACS, sem exigir GPU ou processamento volumétrico.

### Camada 4: histórico clínico longitudinal

Adicionar contexto clínico prévio:

- Comorbidades: hipertensão, diabetes, fibrilação atrial, AVC prévio, demência, epilepsia, câncer, DRC, IC, DPOC.
- Fragilidade, quedas prévias, dependência funcional, uso de home care.
- Medicamentos crônicos: anticoagulantes, antiagregantes, anti-hipertensivos, hipoglicemiantes, psicotrópicos.
- Histórico de laudos, diagnósticos, CID, procedimentos e linhas de cuidado.

Uso esperado: melhora relevante para risco de sangramento, internação, retorno, mortalidade e custo.

### Camada 5: exames laboratoriais e dados clínicos recentes

Adicionar dados estruturados próximos ao evento:

- Hemograma, plaquetas, INR/TP/TTPa, creatinina, ureia, sódio, potássio, PCR, troponina quando disponível.
- Tendências recentes de laboratório nos últimos 30/90 dias.
- Resultados críticos e ausência de exames como variável informativa.

Uso esperado: melhora para UTI, internação, complicação, custo e mortalidade.

### Camada 6: texto clínico e laudos

Adicionar NLP antes da análise dos pixels:

- Texto da queixa, evolução médica, triagem e hipótese diagnóstica.
- Laudo da TC de crânio quando disponível.
- Extração de achados: hemorragia, AVC isquêmico, massa, edema, hidrocefalia, fratura, atrofia, microangiopatia, ausência de achado agudo.
- Negações e incerteza: "sem sinais de", "não se observa", "sugestivo", "não exclui".

Uso esperado: grande ganho para achado agudo, internação, especialista, repetição de exame e conduta.

### Camada 7: trajetória assistencial e intervenções

Adicionar ações tomadas no episódio:

- Especialidades acionadas.
- Medicações específicas, reversão de anticoagulação, trombólise, anticonvulsivantes.
- Solicitação de leito, transferência, observação, protocolos abertos.
- Encaminhamento pós-alta, consulta agendada, contato ativo e orientações.

Uso esperado: melhora preditiva, mas exige cuidado com vazamento. Variáveis que ocorrem depois da decisão clínica não podem ser usadas para predizer essa mesma decisão.

### Camada 8: determinantes de cuidado e relacionamento

Adicionar quando houver maturidade de dados:

- Adesão a consultas e exames.
- Absenteísmo.
- Distância até unidade.
- Rede de apoio, quando documentada.
- Participação em programas de cuidado.
- Contatos em central, queixas recorrentes e sinais de baixa navegabilidade.

Uso esperado: melhora para retorno ao PS, reinternação, custo e falha de transição.

### Camada 9: imagem da TC de crânio

Camada multimodal baseada nos pixels/volume do exame:

- DICOM ou séries convertidas com controle de qualidade.
- Volume 3D da TC de crânio como entrada principal, preservando a informação espacial entre cortes.
- CNN 3D treinada sobre o exame, com padronização de voxel spacing, orientação, dimensão, intensidade e janela.
- Segmentação/seleção de cortes, protocolo, contraste, artefatos e metadados do equipamento como etapas de controle e enriquecimento.
- Embeddings extraídos da CNN 3D combinados com dados tabulares e texto em um modelo multimodal.
- Treinamento em múltiplos desenhos: imagem pura, imagem + metadados DICOM, imagem + dados clínicos disponíveis até a aquisição, imagem + laudo e fusão tardia com todas as camadas.

A CNN 3D não precisa ser forçada para o fim do desenvolvimento. Ela pode ser testada desde cedo se houver dados, infraestrutura e coorte suficientes. O que deve ser evitado é confundir um bom resultado isolado da imagem com ganho real sobre modelos mais simples ou mais baratos.

Para essa fase, a hipótese principal é que a CNN 3D aprenda padrões volumétricos do exame que não aparecem integralmente no laudo ou nos dados estruturados, como distribuição espacial de sangramentos, edema, assimetrias, efeito de massa, sinais sutis e artefatos relevantes. A comparação correta não é apenas imagem contra dados clínicos, mas sim o ganho incremental da imagem sobre o melhor modelo tabular/textual já disponível.

Essa decisão deve separar duas perguntas:

1. **Valor preditivo incremental:** a imagem melhora AUC, AUPRC, calibração ou utilidade clínica sobre o melhor modelo tabular/textual?
2. **Valor operacional temporal:** a imagem permite agir antes do laudo radiológico ou antes da decisão clínica registrada?

Essa distinção é importante porque a imagem pode não superar de forma relevante o laudo em performance retrospectiva, mas ainda assim ter valor se antecipar uma conduta crítica no PS. Portanto, a CNN 3D deve ser avaliada tanto pelo ganho estatístico quanto pela capacidade de encurtar tempo até intervenção.

Ressalvas técnicas para a fase de imagem:

- A CNN 3D é apropriada para TC de crânio porque preserva relações espaciais entre cortes, mas aumenta custo computacional, complexidade de pré-processamento e risco de overfitting.
- O pré-processamento faz parte do modelo: voxel spacing, orientação, número de cortes, intensidade, janelas, contraste, protocolo, artefatos e scanner precisam ser controlados e versionados.
- Deve-se testar validação temporal e por unidade/equipamento para reduzir o risco de o modelo aprender atalhos operacionais, como protocolo de scanner ou perfil de encaminhamento, em vez de achados clínicos reais.
- Se a amostra inicial for limitada, considerar backbone 3D pré-treinado e fine-tuning controlado antes de treinamento totalmente do zero.
- A arquitetura multimodal deve tratar a CNN 3D como encoder de imagem; a fusão com dados tabulares, laboratoriais, histórico clínico e texto deve ocorrer depois da extração de embeddings.

Desenhos experimentais recomendados para a CNN 3D:

| Desenho | Entradas | Momento de uso | Pergunta respondida |
| --- | --- | --- | --- |
| Imagem pura | Volume 3D da TC | Após aquisição/disponibilização da série | Quanto o exame sozinho prediz? |
| Imagem + metadados | Volume 3D + metadados DICOM | Após chegada ao PACS/VNA | O contexto técnico do exame melhora ou estabiliza a predição? |
| Imagem precoce + clínica mínima | Volume 3D + idade, sexo, sinais vitais, queixa, classificação de risco | Antes do laudo | A imagem antecipa risco antes da interpretação radiológica formal? |
| Imagem + laudo | Volume 3D + NLP do laudo | Após laudo | A imagem acrescenta algo além do texto radiológico? |
| Multimodal completo | Volume 3D + tabular + laboratório + histórico + texto | Uso retrospectivo/estratégico ou decisão tardia | Qual é o teto de performance com todas as fontes? |

## Estratégia de treinamento

1. Construir coorte retrospectiva com tempo zero e rótulos auditáveis.
2. Treinar baseline com Camada 1.
3. Adicionar uma camada por vez e registrar ganho incremental nos modelos tabulares/textuais.
4. Em paralelo, testar desenhos específicos com CNN 3D: imagem pura, imagem + metadados, imagem precoce + clínica mínima, imagem + laudo e multimodal completo.
5. Separar treino, validação e teste por tempo, preservando teste prospectivo mais recente.
6. Avaliar AUC, AUPRC, calibração, sensibilidade em faixas de alto risco, decisão clínica e impacto econômico esperado.
7. Verificar vazamento de informação em cada variável.
8. Definir limiares por uso: triagem de risco, alerta clínico, gestão de leito, transição de cuidado ou revisão humana.
9. Fazer validação silenciosa prospectiva antes de qualquer alerta em produção.
10. Monitorar drift, queda de desempenho, mudança de prática e impacto real após implantação.

## Entregáveis da POC

- Dicionário de dados por camada.
- Definição formal da coorte e dos desfechos.
- Pipeline reprodutível de extração, limpeza, feature store e treino.
- Modelos baseline e incrementais por camada.
- Relatório de desempenho por desfecho e subgrupo.
- Análise de ganho incremental por camada.
- Simulação de impacto clínico e econômico por limiar.
- Plano de validação prospectiva silenciosa.
- Proposta de fluxo operacional para uso do escore no PS.

## Critérios de sucesso

Um modelo deve avançar para piloto se cumprir os critérios abaixo:

- Desfecho acionável e aceito pelas áreas clínica, operacional e econômica.
- Performance superior ao baseline simples e estável em teste temporal.
- Boa calibração nas faixas de risco usadas para decisão.
- Ganho incremental claro da camada ou combinação adicionada.
- Ausência de vazamento de informação relevante.
- Explicabilidade suficiente para revisão clínica.
- Plano de intervenção associado ao alerta.
- Monitoramento de segurança, viés, drift e impacto.

## Decisões iniciais recomendadas

- Começar com os desfechos de internação 24h, UTI/sala crítica 24h, retorno ao PS 72h/7d e custo alto 30d.
- Usar internação 24h como primeiro modelo de validação do pipeline.
- Usar UTI/sala crítica como primeiro modelo de maior impacto clínico.
- Usar retorno ao PS como primeiro modelo de transição de cuidado.
- Incluir evento da TC e metadados DICOM cedo, logo após os dados estruturados do episódio de PS.
- Testar CNN 3D em múltiplos momentos, inclusive como imagem pura logo após a aquisição, quando houver infraestrutura e amostra suficientes.
- Incluir laudo da TC via NLP como uma das combinações comparativas, não como pré-requisito para testar pixels ou volume.
- Decidir implantação pelo melhor equilíbrio entre performance, tempo de disponibilidade, custo computacional, robustez e ação clínica possível.
