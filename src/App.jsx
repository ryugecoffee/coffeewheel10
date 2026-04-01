import { Analytics } from '@vercel/analytics/react';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import FlavorWheel from "./FlavorWheel";
import CoffeeFlavorWheelPDF from "./CoffeeFlavorWheelPDF";
import { buildMainWheelSegments } from "./wheelGeometry";
import { t } from "./i18n";
import { translateFlavor } from "./flavorTranslations";
import { auth, provider, db } from "./firebase";
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

function generatePdfFileName(note) {
  const country = note.country || "Unknown";
  const farm = note.farm || "Farm";

  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${country}_${farm}_${yyyy}-${mm}-${dd}.pdf`;
}

const CURRENT_NOTE_KEY = "coffee-note-current";
const SAVED_NOTES_KEY = "coffee-note-saved";
const FARM_HISTORY_KEY = "coffee-note-farm-history";
const VARIETY_HISTORY_KEY = "coffee-note-variety-history";
const DRIPPER_HISTORY_KEY = "coffee-note-dripper-history";
const ROASTER_HISTORY_KEY = "coffee-note-roaster-history";
const LEGAL_MODAL_SCROLL_KEY = "coffee-legal-scroll-top";

const COUNTRY_OPTIONS = [
  "Brazil",
  "Colombia",
  "Costa Rica",
  "Ethiopia",
  "Guatemala",
  "Honduras",
  "Indonesia",
  "Kenya",
  "Nicaragua",
  "Panama",
  "Peru",
  "Rwanda",
  "Tanzania",
  "Uganda",
  "Yemen",
  "Bolivia",
  "Burundi",
  "China",
  "El Salvador",
  "India",
  "Jamaica",
  "Mexico",
  "Papua New Guinea",
  "Thailand",
  "Vietnam",
  "Japan",
];

const MAIN_WHEEL_TOP_LABELS = [
  "FRUITY",
  "SOUR/ FERMENTED",
  "GREEN/ VEGETATIVE",
  "OTHER",
  "ROASTED",
  "SPICES",
  "NUTTY/ COCOA",
  "SWEET",
  "FLORAL",
];

const APP_TEXT = {
  en: {
    checkingLogin: "Checking login...",
    loggedOutStatus: "Not logged in · local save only",
    cloudSyncOn: "Cloud sync on",
    syncing: "Syncing...",
    loginWithGoogle: "Login with Google",
    logout: "Logout",

    accountSectionTitle: "Account & data",
    loginShortConsent:
      "By logging in, you agree to the Terms of Use and Privacy Policy, including cloud storage and synchronization of your notes.",
    guestShortNotice:
      "Without login, your data is stored only on this device using localStorage. It may be lost if you switch devices, clear browser data, or reinstall the app.",
    loggedInShortNotice:
      "When logged in, your saved notes are stored in Firebase so they can sync across your devices.",
    analyticsShortNotice:
      "To improve the service, anonymized and aggregated usage data may be used for analysis, product development, and quality improvement.",
    legalOpenPrivacy: "Privacy Policy",
    legalOpenTerms: "Terms of Use",
    legalOpenDataNotice: "How data is handled",
    legalModalClose: "Close",

    dataHandlingTitle: "How your data is handled",
    dataHandlingBody:
      "Guest mode stores data only in your current browser. Login mode stores saved notes in Firebase linked to your Google account so they can sync across devices. We may also review anonymized, aggregated usage patterns to improve the service and develop future features.",

    guestModeBadge: "Guest mode",
    accountModeBadge: "Account mode",

    legalLastUpdatedLabel: "Last updated",
    legalUpdatedDate: "2026-04-02",

    privacyTitle: "Privacy Policy",
    termsTitle: "Terms of Use",

    privacyBody: `
This Privacy Policy explains how this service (the “Service”) handles personal information and user-entered data.

1. Information We Collect
The Service may collect the following information:
- Basic account information provided through Google Sign-In, such as your display name and email address.
- Notes, tasting records, memo fields, and other information you enter into the Service.
- Technical and usage information such as browser type, device information, access timestamps, and operational logs, to the extent reasonably necessary for operation, troubleshooting, analytics, and security.

2. Purposes of Use
Collected information may be used for the following purposes:
- To provide the Service and its core functions.
- To save and synchronize user data across devices when logged in.
- To maintain, protect, troubleshoot, and improve the Service.
- To analyze usage trends and improve usability, quality, and future features.
- To use anonymized or aggregated data for research, product development, quality improvement, and service planning.

3. Storage of Data
- If you use the Service without logging in, your data is stored only in your browser or device through localStorage or similar local storage technology.
- If you log in, your saved notes and related data may be stored in cloud infrastructure such as Firebase in association with your account.

4. Local Storage for Guest Users
Data saved without login is not tied to an account and may be lost if:
- you change devices,
- clear browser or app data,
- use private browsing,
- reinstall the app, or
- use a different browser or environment.
The Service is not responsible for loss of locally stored guest data.

5. Data Sharing and Third Parties
The Service does not sell personal information.
The Service may rely on third-party service providers such as Google and Firebase for authentication, hosting, storage, or related technical functions. Information may be processed by such providers to the extent necessary to operate the Service.
The Service may also disclose information when required by applicable law, legal process, or to protect rights, safety, and security.

6. Anonymized or Aggregated Data
The Service may use data that has been processed so that individuals are not reasonably identifiable, or that has been aggregated into statistical form, for analytics, product planning, service improvement, quality evaluation, and related business purposes.

7. Data Security
Reasonable administrative and technical measures are taken to reduce risks of unauthorized access, loss, misuse, alteration, or disclosure. However, no security measure can guarantee absolute security.

8. Retention
Information may be retained for as long as reasonably necessary for the purposes described in this Policy, unless a longer retention period is required or permitted by law.

9. Children
The Service is not intended for users who are below the age required to validly consent under applicable law unless appropriate consent has been obtained from a parent or guardian.

10. Changes to This Policy
This Privacy Policy may be updated from time to time. The revised version becomes effective when posted in the Service unless otherwise stated.

11. Contact
For questions regarding this Privacy Policy or data handling, please contact the operator through the contact method made available by the Service.
`.trim(),

    termsBody: `
These Terms of Use govern your use of this service (the “Service”). By using the Service, you agree to these Terms.

1. Scope
These Terms apply to all use of the Service, whether as a logged-in user or as a guest user.

2. Eligibility and Account Use
When using Google Sign-In or other account-based features, you are responsible for the account you use and for activity conducted through that account.

3. Guest Use and Local Storage
The Service may be used without logging in. In that case, data may be stored only on your device or browser. You understand that such locally stored data may be lost and may not be recoverable by the operator.

4. User Responsibility
You are responsible for the content you enter, store, export, or otherwise use through the Service. You agree not to use the Service in violation of law, third-party rights, or these Terms.

5. Prohibited Conduct
You must not:
- interfere with or disrupt the operation of the Service,
- attempt unauthorized access to systems or data,
- upload or input unlawful, infringing, harmful, or abusive content,
- misuse exported materials or service content in a way that violates applicable law or third-party rights.

6. Intellectual Property
Rights in the Service, including software, UI, text, branding, and related materials, belong to the operator or rightful licensors unless otherwise stated. These Terms do not transfer ownership of the Service or its intellectual property.

7. Service Changes and Suspension
The operator may modify, suspend, or discontinue all or part of the Service at any time when reasonably necessary for maintenance, improvement, compliance, security, or operational reasons.

8. Disclaimer
The Service is provided on an “as is” and “as available” basis. To the maximum extent permitted by law, the operator does not guarantee uninterrupted operation, complete accuracy, or that the Service will meet every particular purpose.

9. Limitation of Liability
To the maximum extent permitted by law, the operator is not liable for indirect, incidental, special, consequential, or data-loss-related damages arising from use of or inability to use the Service. This includes loss of locally stored guest data.

10. Termination or Restriction
The operator may restrict or terminate access to the Service if necessary due to violation of these Terms, security reasons, operational issues, or legal compliance needs.

11. Changes to These Terms
These Terms may be updated from time to time. Continued use of the Service after changes take effect constitutes acceptance of the updated Terms.

12. Governing Principles
These Terms shall be interpreted in accordance with applicable law and general principles of good faith and fairness.
`.trim(),
  },

  ja: {
    checkingLogin: "ログイン状態を確認中...",
    loggedOutStatus: "未ログイン · この端末の保存のみ",
    cloudSyncOn: "クラウド同期オン",
    syncing: "同期中...",
    loginWithGoogle: "Googleでログイン",
    logout: "ログアウト",

    accountSectionTitle: "アカウントとデータ",
    loginShortConsent:
      "ログインすることで、利用規約およびプライバシーポリシーに同意したものとみなされ、ノートのクラウド保存・同期が有効になります。",
    guestShortNotice:
      "未ログインの場合、データはこの端末のブラウザ内（localStorage）にのみ保存されます。端末変更、ブラウザデータ削除、アプリ再インストール等により失われる場合があります。",
    loggedInShortNotice:
      "ログイン中は、保存したノートが Firebase に保存され、端末をまたいで同期できるようになります。",
    analyticsShortNotice:
      "本サービスでは、サービス改善、商品開発、品質向上のため、匿名化・統計化した利用データを分析に利用する場合があります。",
    legalOpenPrivacy: "プライバシーポリシー",
    legalOpenTerms: "利用規約",
    legalOpenDataNotice: "データの扱い",
    legalModalClose: "閉じる",

    dataHandlingTitle: "データの扱いについて",
    dataHandlingBody:
      "ゲスト利用ではデータは現在のブラウザ内にのみ保存されます。ログイン時は、保存したノートが Google アカウントに紐づく Firebase 上に保存され、複数端末で同期されます。また、本サービスでは、匿名化・統計化した利用傾向を、サービス改善や今後の機能開発のために確認する場合があります。",

    guestModeBadge: "ゲスト利用",
    accountModeBadge: "アカウント利用",

    legalLastUpdatedLabel: "最終更新日",
    legalUpdatedDate: "2026-04-02",

    privacyTitle: "プライバシーポリシー",
    termsTitle: "利用規約",

    privacyBody: `
本サービス（以下「本サービス」といいます。）は、ユーザーの個人情報および入力データの取扱いについて、以下のとおりプライバシーポリシーを定めます。

1. 取得する情報
本サービスは、次の情報を取得する場合があります。
- Google ログインにより提供される表示名、メールアドレス等の基本情報
- ユーザーが本サービスに入力、保存、出力するテイスティングノート、メモ、選択情報その他の入力データ
- サービスの運用、障害対応、分析およびセキュリティ確保のために合理的に必要な範囲の技術情報、利用情報、アクセス時刻、端末情報、ブラウザ情報、操作ログ等

2. 利用目的
取得した情報は、次の目的のために利用します。
- 本サービスの提供および本人認証のため
- ログインユーザーの保存データをクラウド上に保存し、端末間で同期するため
- 本サービスの保守、障害対応、不正利用防止、セキュリティ向上のため
- 本サービスの利用状況を分析し、操作性、品質、機能、表現等を改善するため
- 匿名化または統計化したデータを、商品開発、サービス改善、品質向上、研究・分析、将来の機能企画の参考として利用するため

3. データの保存場所
- 未ログインで本サービスを利用する場合、入力データは localStorage その他これに類するブラウザ内保存機能を通じて、利用中の端末またはブラウザ内に保存されることがあります。
- ログインして本サービスを利用する場合、保存したノートその他関連データは、Firebase 等のクラウド基盤上に、ユーザーのアカウントに関連付けて保存されることがあります。

4. 未ログイン利用時のローカル保存について
未ログイン時に保存されたデータはアカウントに紐付かず、次の場合に失われることがあります。
- 端末を変更した場合
- ブラウザまたはアプリの保存データを削除した場合
- シークレットモードやプライベートブラウズを利用した場合
- アプリを再インストールした場合
- 別のブラウザまたは別環境でアクセスした場合
本サービスは、未ログイン利用時のローカル保存データの消失について責任を負いません。

5. 第三者提供および外部サービス
本サービスは、個人情報を販売しません。
本サービスは、認証、ホスティング、データ保存その他技術的提供のために、Google、Firebase その他の外部サービスを利用する場合があります。これらの外部事業者は、本サービス運営上必要な範囲で情報を処理することがあります。
また、法令に基づく場合、裁判所・行政機関その他公的機関から適法な要請がある場合、または権利・安全・セキュリティ保護のために必要な場合には、情報を開示することがあります。

6. 匿名化・統計化データの利用
本サービスは、個人を合理的に識別できない形に加工した情報、または複数ユーザーの情報を集計した統計情報を、分析、商品企画、品質評価、サービス改善その他これに関連する事業上の目的のために利用する場合があります。

7. 安全管理
本サービスは、不正アクセス、漏えい、滅失、改ざん、誤用等の防止に向けて、合理的な安全管理措置を講じるよう努めます。ただし、あらゆるリスクを完全に排除できることを保証するものではありません。

8. 保存期間
取得した情報は、本ポリシー記載の目的達成に必要な期間、または法令上認められる期間、保持されることがあります。

9. 未成年者による利用
本サービスは、適用法令上有効な同意を単独で行うことができない年齢のユーザーによる利用を想定する場合、必要に応じて保護者等の関与または同意が求められることがあります。

10. ポリシーの変更
本サービスは、必要に応じて本ポリシーを変更することがあります。変更後のポリシーは、本サービス上に掲載された時点または別途定める時点から効力を生じます。

11. お問い合わせ
本ポリシーまたはデータの取扱いに関するお問い合わせは、本サービス上で案内する運営者の連絡手段よりご連絡ください。
`.trim(),

    termsBody: `
本利用規約（以下「本規約」といいます。）は、本サービスの利用条件を定めるものです。ユーザーは、本サービスを利用することにより、本規約に同意したものとみなされます。

1. 適用範囲
本規約は、ログインユーザー、未ログインユーザーを問わず、本サービスの利用に関する一切の関係に適用されます。

2. アカウント利用
Google ログインその他のアカウント機能を利用する場合、ユーザーは自己の責任において利用アカウントを管理するものとし、当該アカウントを通じて行われた行為について責任を負うものとします。

3. 未ログイン利用とローカル保存
本サービスは、ログインせずに利用することができます。この場合、データはユーザーの端末またはブラウザ内にのみ保存されることがあります。ユーザーは、このようなデータが失われる場合があり、運営者が復元できないことを理解したうえで利用するものとします。

4. ユーザーの責任
ユーザーは、本サービスに入力、保存、出力または共有する情報について、自ら責任を負うものとします。ユーザーは、法令、本規約、第三者の権利を侵害する態様で本サービスを利用してはなりません。

5. 禁止事項
ユーザーは、次の行為を行ってはなりません。
- 本サービスの運営を妨害する行為
- システムまたはデータへの不正アクセスを試みる行為
- 違法、不当、権利侵害的、有害または攻撃的な内容を入力・送信する行為
- 本サービスまたは出力物を、法令または第三者の権利に反する形で利用する行為

6. 知的財産権
本サービスに関するプログラム、UI、文言、ブランド、デザインその他一切の権利は、別段の定めがある場合を除き、運営者または正当な権利者に帰属します。本規約は、これらの権利をユーザーに譲渡または許諾するものではありません。

7. サービス内容の変更・停止
運営者は、保守、改善、法令対応、セキュリティ対応、運営上の都合その他合理的理由がある場合、本サービスの全部または一部を変更、停止または終了することがあります。

8. 保証の否認
本サービスは「現状有姿」かつ「提供可能な範囲」で提供されます。運営者は、法令上許される範囲で、本サービスの継続性、完全性、正確性、特定目的適合性等について保証しません。

9. 責任の制限
法令上許される範囲で、運営者は、本サービスの利用または利用不能に起因して生じる間接損害、特別損害、結果的損害、逸失利益、データ消失損害等について責任を負いません。未ログイン利用時のローカル保存データの消失についても同様とします。

10. 利用制限・終了
運営者は、ユーザーが本規約に違反した場合、セキュリティ上の理由がある場合、運営上必要がある場合、または法令遵守上必要がある場合、ユーザーによる本サービスの利用を制限または終了できるものとします。

11. 規約の変更
運営者は、必要に応じて本規約を変更することがあります。変更後の規約の効力発生日以後に本サービスを利用した場合、ユーザーは変更後の規約に同意したものとみなされます。

12. 準拠
本規約は、適用される法令および一般的な信義則に従って解釈されるものとします。
`.trim(),
  },

  es: {
    checkingLogin: "Comprobando inicio de sesión...",
    loggedOutStatus: "Sin iniciar sesión · guardado solo en este dispositivo",
    cloudSyncOn: "Sincronización en la nube activada",
    syncing: "Sincronizando...",
    loginWithGoogle: "Iniciar sesión con Google",
    logout: "Cerrar sesión",

    accountSectionTitle: "Cuenta y datos",
    loginShortConsent:
      "Al iniciar sesión, aceptas los Términos de uso y la Política de privacidad, incluido el almacenamiento y la sincronización en la nube de tus notas.",
    guestShortNotice:
      "Si no inicias sesión, tus datos se guardan solo en este dispositivo mediante localStorage. Pueden perderse si cambias de dispositivo, borras los datos del navegador o reinstalas la app.",
    loggedInShortNotice:
      "Cuando inicias sesión, tus notas guardadas se almacenan en Firebase para poder sincronizarse entre tus dispositivos.",
    analyticsShortNotice:
      "Para mejorar el servicio, los datos de uso anonimizados y agregados pueden utilizarse para análisis, desarrollo de productos y mejora de la calidad.",
    legalOpenPrivacy: "Política de privacidad",
    legalOpenTerms: "Términos de uso",
    legalOpenDataNotice: "Cómo se tratan los datos",
    legalModalClose: "Cerrar",

    dataHandlingTitle: "Cómo se tratan tus datos",
    dataHandlingBody:
      "En modo invitado, los datos se guardan solo en el navegador actual. En modo con cuenta, las notas guardadas se almacenan en Firebase vinculado a tu cuenta de Google para sincronizarse entre dispositivos. También podemos revisar patrones de uso anonimizados y agregados para mejorar el servicio y desarrollar futuras funciones.",

    guestModeBadge: "Modo invitado",
    accountModeBadge: "Modo cuenta",

    legalLastUpdatedLabel: "Última actualización",
    legalUpdatedDate: "2026-04-02",

    privacyTitle: "Política de privacidad",
    termsTitle: "Términos de uso",

    privacyBody: `
Esta Política de privacidad explica cómo este servicio (el “Servicio”) trata la información personal y los datos introducidos por el usuario.

1. Información que recopilamos
El Servicio puede recopilar la siguiente información:
- Información básica de cuenta proporcionada mediante Google Sign-In, como nombre visible y correo electrónico.
- Notas, registros de cata, campos de memo y otra información que introduzcas en el Servicio.
- Información técnica y de uso, como tipo de navegador, información del dispositivo, marcas de tiempo de acceso y registros operativos, en la medida razonablemente necesaria para el funcionamiento, solución de problemas, análisis y seguridad.

2. Finalidades de uso
La información recopilada puede utilizarse para:
- Proporcionar el Servicio y sus funciones principales.
- Guardar y sincronizar datos del usuario entre dispositivos cuando ha iniciado sesión.
- Mantener, proteger, diagnosticar y mejorar el Servicio.
- Analizar tendencias de uso y mejorar la usabilidad, la calidad y las funciones futuras.
- Utilizar datos anonimizados o agregados para investigación, desarrollo de productos, mejora de la calidad y planificación del servicio.

3. Almacenamiento de datos
- Si utilizas el Servicio sin iniciar sesión, tus datos se guardan solo en tu navegador o dispositivo mediante localStorage u otra tecnología similar de almacenamiento local.
- Si inicias sesión, tus notas guardadas y datos relacionados pueden almacenarse en infraestructura en la nube como Firebase en asociación con tu cuenta.

4. Almacenamiento local para usuarios invitados
Los datos guardados sin iniciar sesión no se vinculan a una cuenta y pueden perderse si:
- cambias de dispositivo,
- borras los datos del navegador o de la app,
- utilizas navegación privada,
- reinstalas la app, o
- accedes desde otro navegador o entorno.
El Servicio no se hace responsable de la pérdida de datos locales guardados en modo invitado.

5. Compartición de datos y terceros
El Servicio no vende información personal.
El Servicio puede depender de proveedores externos, como Google y Firebase, para autenticación, alojamiento, almacenamiento u otras funciones técnicas relacionadas. La información puede ser tratada por dichos proveedores en la medida necesaria para operar el Servicio.
El Servicio también puede divulgar información cuando lo exija la ley aplicable, un proceso legal o para proteger derechos, seguridad y protección.

6. Datos anonimizados o agregados
El Servicio puede utilizar datos procesados de forma que las personas no sean razonablemente identificables, o datos agregados en forma estadística, para análisis, planificación de productos, mejora del servicio, evaluación de calidad y fines empresariales relacionados.

7. Seguridad de los datos
Se adoptan medidas administrativas y técnicas razonables para reducir riesgos de acceso no autorizado, pérdida, uso indebido, alteración o divulgación. Sin embargo, ninguna medida de seguridad puede garantizar protección absoluta.

8. Conservación
La información puede conservarse durante el tiempo razonablemente necesario para las finalidades descritas en esta Política, salvo que la ley exija o permita un periodo más largo.

9. Menores
El Servicio no está destinado a usuarios menores de la edad requerida para prestar consentimiento válido conforme a la ley aplicable, salvo que se haya obtenido el consentimiento adecuado de un padre, madre o tutor.

10. Cambios en esta Política
Esta Política de privacidad puede actualizarse periódicamente. La versión revisada entra en vigor cuando se publica en el Servicio, salvo que se indique otra cosa.

11. Contacto
Si tienes preguntas sobre esta Política de privacidad o sobre el tratamiento de datos, ponte en contacto con la persona operadora mediante el método de contacto disponible en el Servicio.
`.trim(),

    termsBody: `
Estos Términos de uso regulan tu uso de este servicio (el “Servicio”). Al utilizar el Servicio, aceptas estos Términos.

1. Alcance
Estos Términos se aplican a todo uso del Servicio, tanto si has iniciado sesión como si lo utilizas como invitado.

2. Elegibilidad y uso de cuenta
Cuando utilices Google Sign-In u otras funciones basadas en cuenta, eres responsable de la cuenta que utilices y de la actividad realizada a través de ella.

3. Uso como invitado y almacenamiento local
El Servicio puede utilizarse sin iniciar sesión. En ese caso, los datos pueden almacenarse solo en tu dispositivo o navegador. Entiendes que dichos datos locales pueden perderse y que la persona operadora puede no poder recuperarlos.

4. Responsabilidad del usuario
Eres responsable del contenido que introduzcas, guardes, exportes o utilices a través del Servicio. Aceptas no utilizar el Servicio infringiendo la ley, derechos de terceros o estos Términos.

5. Conductas prohibidas
No debes:
- interferir ni interrumpir el funcionamiento del Servicio,
- intentar acceder sin autorización a sistemas o datos,
- cargar o introducir contenido ilícito, infractor, dañino o abusivo,
- utilizar materiales exportados o contenidos del Servicio de una manera que infrinja la ley aplicable o derechos de terceros.

6. Propiedad intelectual
Los derechos sobre el Servicio, incluidos software, interfaz, textos, marca y materiales relacionados, pertenecen a la persona operadora o a quienes ostenten legítimamente dichos derechos, salvo indicación en contrario. Estos Términos no transfieren la propiedad del Servicio ni de su propiedad intelectual.

7. Cambios y suspensión del Servicio
La persona operadora puede modificar, suspender o interrumpir total o parcialmente el Servicio en cualquier momento cuando sea razonablemente necesario por mantenimiento, mejora, cumplimiento, seguridad u otras razones operativas.

8. Exclusión de garantías
El Servicio se proporciona “tal cual” y “según disponibilidad”. En la máxima medida permitida por la ley, la persona operadora no garantiza el funcionamiento ininterrumpido, la exactitud completa ni que el Servicio satisfaga cualquier finalidad particular.

9. Limitación de responsabilidad
En la máxima medida permitida por la ley, la persona operadora no será responsable de daños indirectos, incidentales, especiales, consecuenciales o relacionados con pérdida de datos derivados del uso o de la imposibilidad de uso del Servicio. Esto incluye la pérdida de datos locales guardados en modo invitado.

10. Terminación o restricción
La persona operadora puede restringir o terminar el acceso al Servicio si es necesario debido a incumplimiento de estos Términos, razones de seguridad, problemas operativos o necesidades de cumplimiento legal.

11. Cambios en estos Términos
Estos Términos pueden actualizarse periódicamente. El uso continuado del Servicio después de que los cambios entren en vigor constituye aceptación de los Términos actualizados.

12. Principios aplicables
Estos Términos se interpretarán de conformidad con la ley aplicable y los principios generales de buena fe y equidad.
`.trim(),
  },
};

const emptyNote = {
  country: "",
  farm: "",
  roastDate: "",
  variety: "",
  dripper: "",
  roaster: "",
  memo: "",
  lang: "en",
  cupProfileSelections: [],
  mainSelections: [],
  secondarySelections: [],
  selectedMainLabels: [],
  selectedMiddleLabels: [],
  selectedLeafLabels: [],
};

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeLabel(label = "") {
  return String(label)
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function appText(lang, key) {
  return (
    APP_TEXT?.[lang]?.[key] ??
    APP_TEXT?.en?.[key] ??
    key
  );
}

const wheelGeometry = buildMainWheelSegments();

const ring1LabelSet = new Set(
  safeArray(wheelGeometry?.ring1Segments).map((seg) =>
    normalizeLabel(seg?.label)
  )
);

const ring2LabelSet = new Set(
  safeArray(wheelGeometry?.ring2Segments).map((seg) =>
    normalizeLabel(seg?.label)
  )
);

const ring3LabelSet = new Set(
  safeArray(wheelGeometry?.ring3Segments).map((seg) =>
    normalizeLabel(seg?.label)
  )
);

function splitMainSelectionsForPdf(
  mainSelections = [],
  secondarySelections = []
) {
  const tops = safeArray(mainSelections);
  const details = safeArray(secondarySelections);

  const topLabels = [];
  const middleLabels = [];
  const leafLabels = [];

  tops.forEach((label) => {
    const raw = String(label || "").trim();
    const normalized = normalizeLabel(raw);
    if (!raw) return;

    if (
      MAIN_WHEEL_TOP_LABELS.includes(normalized) ||
      ring1LabelSet.has(normalized)
    ) {
      topLabels.push(raw);
    }
  });

  details.forEach((label) => {
    const raw = String(label || "").trim();
    const normalized = normalizeLabel(raw);
    if (!raw) return;

    if (ring2LabelSet.has(normalized)) {
      middleLabels.push(raw);
      return;
    }

    if (ring3LabelSet.has(normalized)) {
      leafLabels.push(raw);
    }
  });

  return {
    selectedMainLabels: [...new Set(topLabels)],
    selectedMiddleLabels: [...new Set(middleLabels)],
    selectedLeafLabels: [...new Set(leafLabels)],
  };
}

function normalizeSavedNote(note) {
  const mainSelections = safeArray(note?.mainSelections);
  const derived = splitMainSelectionsForPdf(
    mainSelections,
    safeArray(note?.secondarySelections)
  );

  return {
    docId: note?.docId || "",
    country: note?.country || "",
    farm: note?.farm || "",
    roastDate: note?.roastDate || "",
    variety: note?.variety || "",
    dripper: note?.dripper || "",
    roaster: note?.roaster || "",
    memo: note?.memo || "",
    lang: note?.lang || "en",
    cupProfileSelections: safeArray(note?.cupProfileSelections),
    mainSelections,
    secondarySelections: safeArray(note?.secondarySelections),
    selectedMainLabels: safeArray(note?.selectedMainLabels).length
      ? safeArray(note?.selectedMainLabels)
      : derived.selectedMainLabels,
    selectedMiddleLabels: safeArray(note?.selectedMiddleLabels).length
      ? safeArray(note?.selectedMiddleLabels)
      : derived.selectedMiddleLabels,
    selectedLeafLabels: safeArray(note?.selectedLeafLabels).length
      ? safeArray(note?.selectedLeafLabels)
      : derived.selectedLeafLabels,
    savedAt: note?.savedAt || "",
  };
}

function normalizeHistory(raw) {
  if (!Array.isArray(raw)) return [];

  const map = new Map();

  raw.forEach((item) => {
    if (typeof item === "string") {
      const value = item.trim();
      if (!value) return;
      map.set(value, (map.get(value) || 0) + 1);
      return;
    }

    if (item && typeof item === "object") {
      const value = String(item.value || "").trim();
      const count = Number(item.count || 0);
      if (!value) return;
      map.set(value, (map.get(value) || 0) + Math.max(1, count));
    }
  });

  return Array.from(map.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function loadCurrentNote() {
  const raw = loadJson(CURRENT_NOTE_KEY, emptyNote);
  const mainSelections = safeArray(raw?.mainSelections);
  const derived = splitMainSelectionsForPdf(
    mainSelections,
    safeArray(raw?.secondarySelections)
  );

  return {
    ...emptyNote,
    ...raw,
    mainSelections,
    secondarySelections: safeArray(raw?.secondarySelections),
    cupProfileSelections: safeArray(raw?.cupProfileSelections),
    selectedMainLabels: safeArray(raw?.selectedMainLabels).length
      ? safeArray(raw?.selectedMainLabels)
      : derived.selectedMainLabels,
    selectedMiddleLabels: safeArray(raw?.selectedMiddleLabels).length
      ? safeArray(raw?.selectedMiddleLabels)
      : derived.selectedMiddleLabels,
    selectedLeafLabels: safeArray(raw?.selectedLeafLabels).length
      ? safeArray(raw?.selectedLeafLabels)
      : derived.selectedLeafLabels,
  };
}

function loadSavedNotes() {
  const raw = loadJson(SAVED_NOTES_KEY, []);
  return Array.isArray(raw) ? raw.map(normalizeSavedNote) : [];
}

function loadHistory(key) {
  return normalizeHistory(loadJson(key, []));
}

function saveHistory(key, history) {
  localStorage.setItem(key, JSON.stringify(history));
}

function addToHistory(history, value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return history;

  const map = new Map(history.map((item) => [item.value, item.count]));
  map.set(trimmed, (map.get(trimmed) || 0) + 1);

  return Array.from(map.entries())
    .map(([v, count]) => ({ value: v, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function formatSavedAt(value, lang) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(
    lang === "ja" ? "ja-JP" : lang === "es" ? "es-ES" : "en-US"
  );
}

function createNoteIdentity(note) {
  return [
    note.docId || "",
    note.savedAt || "",
    note.country || "",
    note.farm || "",
    note.roastDate || "",
    note.variety || "",
    note.dripper || "",
    note.roaster || "",
    note.memo || "",
    JSON.stringify(note.mainSelections || []),
    JSON.stringify(note.secondarySelections || []),
    JSON.stringify(note.cupProfileSelections || []),
  ].join("__");
}

function getVisibleMainSelections(mainSelections) {
  return safeArray(mainSelections).filter(
    (item) => !MAIN_WHEEL_TOP_LABELS.includes(String(item).trim().toUpperCase())
  );
}

function getVisibleOuterSelections(secondarySelections) {
  return safeArray(secondarySelections).filter(Boolean);
}

function buildPdfPayload(target, fallbackLang = "en") {
  const normalized = normalizeSavedNote(target || {});
  const split = splitMainSelectionsForPdf(
    normalized.mainSelections,
    normalized.secondarySelections
  );

  return {
    ...normalized,
    lang: normalized.lang || fallbackLang,
    selectedMainLabels:
      normalized.selectedMainLabels?.length > 0
        ? normalized.selectedMainLabels
        : split.selectedMainLabels,
    selectedMiddleLabels:
      normalized.selectedMiddleLabels?.length > 0
        ? normalized.selectedMiddleLabels
        : split.selectedMiddleLabels,
    selectedLeafLabels:
      normalized.selectedLeafLabels?.length > 0
        ? normalized.selectedLeafLabels
        : split.selectedLeafLabels,
    selectedFlavors:
      normalized.selectedLeafLabels?.length > 0
        ? normalized.selectedLeafLabels
        : split.selectedLeafLabels,
    cupProfile: safeArray(normalized.cupProfileSelections),
  };
}

function App() {
  const initialCurrent = loadCurrentNote();

  const [country, setCountry] = useState(initialCurrent.country);
  const [farm, setFarm] = useState(initialCurrent.farm);
  const [roastDate, setRoastDate] = useState(initialCurrent.roastDate);
  const [variety, setVariety] = useState(initialCurrent.variety);
  const [dripper, setDripper] = useState(initialCurrent.dripper);
  const [roaster, setRoaster] = useState(initialCurrent.roaster);
  const [memo, setMemo] = useState(initialCurrent.memo);
  const [lang, setLang] = useState(initialCurrent.lang);
  const [mainSelections, setMainSelections] = useState(initialCurrent.mainSelections);
  const [secondarySelections, setSecondarySelections] = useState(
    initialCurrent.secondarySelections
  );
  const [cupProfileSelections, setCupProfileSelections] = useState(
    initialCurrent.cupProfileSelections
  );

  const [savedNotes, setSavedNotes] = useState(loadSavedNotes);
  const [editingIdentity, setEditingIdentity] = useState(null);
  const [editingDocId, setEditingDocId] = useState(null);
  const [savedToast, setSavedToast] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [farmHistory, setFarmHistory] = useState(() => loadHistory(FARM_HISTORY_KEY));
  const [varietyHistory, setVarietyHistory] = useState(() => loadHistory(VARIETY_HISTORY_KEY));
  const [dripperHistory, setDripperHistory] = useState(() => loadHistory(DRIPPER_HISTORY_KEY));
  const [roasterHistory, setRoasterHistory] = useState(() => loadHistory(ROASTER_HISTORY_KEY));

  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [showFarmSuggestions, setShowFarmSuggestions] = useState(false);
  const [showVarietySuggestions, setShowVarietySuggestions] = useState(false);
  const [showDripperSuggestions, setShowDripperSuggestions] = useState(false);
  const [showRoasterSuggestions, setShowRoasterSuggestions] = useState(false);

  const [legalModal, setLegalModal] = useState(null);

  const countryBlurTimerRef = useRef(null);
  const farmBlurTimerRef = useRef(null);
  const varietyBlurTimerRef = useRef(null);
  const dripperBlurTimerRef = useRef(null);
  const roasterBlurTimerRef = useRef(null);
  const toastTimerRef = useRef(null);

  const loadFromFirebase = async (targetUser) => {
    if (!targetUser?.uid) return;

    setSyncing(true);

    try {
      const snapshot = await getDocs(collection(db, "users", targetUser.uid, "notes"));

      const cloudNotes = snapshot.docs
        .map((snap) =>
          normalizeSavedNote({
            docId: snap.id,
            ...snap.data(),
          })
        )
        .sort((a, b) => {
          const aTime = new Date(a.savedAt || 0).getTime();
          const bTime = new Date(b.savedAt || 0).getTime();
          return bTime - aTime;
        });

      setSavedNotes(cloudNotes);
      localStorage.setItem(SAVED_NOTES_KEY, JSON.stringify(cloudNotes));
    } catch (error) {
      console.error("Firebase load error:", error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady) return;

    if (user) {
      loadFromFirebase(user);
      return;
    }

    setSavedNotes(loadSavedNotes());
  }, [user, authReady]);

  useEffect(() => {
    const split = splitMainSelectionsForPdf(mainSelections, secondarySelections);

    const currentNote = {
      country,
      farm,
      roastDate,
      variety,
      dripper,
      roaster,
      memo,
      lang,
      cupProfileSelections: safeArray(cupProfileSelections),
      mainSelections: safeArray(mainSelections),
      secondarySelections: safeArray(secondarySelections),
      selectedMainLabels: split.selectedMainLabels,
      selectedMiddleLabels: split.selectedMiddleLabels,
      selectedLeafLabels: split.selectedLeafLabels,
    };

    localStorage.setItem(CURRENT_NOTE_KEY, JSON.stringify(currentNote));
  }, [
    country,
    farm,
    roastDate,
    variety,
    dripper,
    roaster,
    memo,
    lang,
    cupProfileSelections,
    mainSelections,
    secondarySelections,
  ]);

  useEffect(() => {
    localStorage.setItem(SAVED_NOTES_KEY, JSON.stringify(savedNotes));
  }, [savedNotes]);

  useEffect(() => {
    saveHistory(FARM_HISTORY_KEY, farmHistory);
  }, [farmHistory]);

  useEffect(() => {
    saveHistory(VARIETY_HISTORY_KEY, varietyHistory);
  }, [varietyHistory]);

  useEffect(() => {
    saveHistory(DRIPPER_HISTORY_KEY, dripperHistory);
  }, [dripperHistory]);

  useEffect(() => {
    saveHistory(ROASTER_HISTORY_KEY, roasterHistory);
  }, [roasterHistory]);

  useEffect(() => {
    if (legalModal) {
      localStorage.setItem(LEGAL_MODAL_SCROLL_KEY, String(window.scrollY || 0));
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [legalModal]);

  useEffect(() => {
    return () => {
      clearTimeout(countryBlurTimerRef.current);
      clearTimeout(farmBlurTimerRef.current);
      clearTimeout(varietyBlurTimerRef.current);
      clearTimeout(dripperBlurTimerRef.current);
      clearTimeout(roasterBlurTimerRef.current);
      clearTimeout(toastTimerRef.current);
    };
  }, []);

  const countrySuggestions = useMemo(() => {
    const keyword = country.trim().toLowerCase();
    if (!keyword) return [];
    return COUNTRY_OPTIONS.filter((item) =>
      item.toLowerCase().includes(keyword)
    ).slice(0, 8);
  }, [country]);

  const makeHistorySuggestions = (value, history) => {
    const keyword = value.trim().toLowerCase();
    if (!keyword) return [];
    return history
      .filter((item) => item.value.toLowerCase().includes(keyword))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
      .slice(0, 8);
  };

  const farmSuggestions = useMemo(
    () => makeHistorySuggestions(farm, farmHistory),
    [farm, farmHistory]
  );
  const varietySuggestions = useMemo(
    () => makeHistorySuggestions(variety, varietyHistory),
    [variety, varietyHistory]
  );
  const dripperSuggestions = useMemo(
    () => makeHistorySuggestions(dripper, dripperHistory),
    [dripper, dripperHistory]
  );
  const roasterSuggestions = useMemo(
    () => makeHistorySuggestions(roaster, roasterHistory),
    [roaster, roasterHistory]
  );

  const filteredSavedNotes = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return savedNotes;

    return savedNotes.filter((note) => {
      const noteLang = note.lang || lang;

      const searchableText = [
        note.country,
        note.farm,
        note.roastDate,
        note.variety,
        note.dripper,
        note.roaster,
        note.memo,
        ...(note.mainSelections || []),
        ...(note.secondarySelections || []),
        ...(note.cupProfileSelections || []),
        ...(note.selectedMainLabels || []),
        ...(note.selectedMiddleLabels || []),
        ...(note.selectedLeafLabels || []),
        formatSavedAt(note.savedAt, noteLang),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(keyword);
    });
  }, [savedNotes, searchTerm, lang]);

  const showToast = () => {
    setSavedToast(true);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setSavedToast(false);
    }, 1600);
  };

  const resetForm = () => {
    setCountry("");
    setFarm("");
    setRoastDate("");
    setVariety("");
    setDripper("");
    setRoaster("");
    setMemo("");
    setLang("en");
    setMainSelections([]);
    setSecondarySelections([]);
    setCupProfileSelections([]);
    setEditingIdentity(null);
    setEditingDocId(null);
    localStorage.setItem(CURRENT_NOTE_KEY, JSON.stringify(emptyNote));
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setEditingIdentity(null);
      setEditingDocId(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSave = async () => {
    const now = new Date().toISOString();
    const split = splitMainSelectionsForPdf(mainSelections, secondarySelections);

    const noteData = {
      country: country.trim(),
      farm: farm.trim(),
      roastDate,
      variety: variety.trim(),
      dripper: dripper.trim(),
      roaster: roaster.trim(),
      memo: memo.trim(),
      lang,
      cupProfileSelections: safeArray(cupProfileSelections),
      mainSelections: safeArray(mainSelections),
      secondarySelections: safeArray(secondarySelections),
      selectedMainLabels: split.selectedMainLabels,
      selectedMiddleLabels: split.selectedMiddleLabels,
      selectedLeafLabels: split.selectedLeafLabels,
      savedAt: now,
    };

    if (
      !noteData.country &&
      !noteData.farm &&
      !noteData.roastDate &&
      !noteData.variety &&
      !noteData.dripper &&
      !noteData.roaster &&
      !noteData.memo &&
      noteData.mainSelections.length === 0 &&
      noteData.secondarySelections.length === 0 &&
      noteData.cupProfileSelections.length === 0
    ) {
      return;
    }

    let nextSavedNotes = [...savedNotes];

    try {
      if (user?.uid) {
        if (editingDocId) {
          const targetRef = doc(db, "users", user.uid, "notes", editingDocId);
          const original = nextSavedNotes.find((item) => item.docId === editingDocId);
          const preservedSavedAt = original?.savedAt || noteData.savedAt;

          await setDoc(targetRef, {
            ...noteData,
            savedAt: preservedSavedAt,
          });

          nextSavedNotes = nextSavedNotes.map((item) =>
            item.docId === editingDocId
              ? normalizeSavedNote({
                  ...noteData,
                  savedAt: preservedSavedAt,
                  docId: editingDocId,
                })
              : item
          );
        } else {
          const added = await addDoc(
            collection(db, "users", user.uid, "notes"),
            noteData
          );

          nextSavedNotes.unshift(
            normalizeSavedNote({
              ...noteData,
              docId: added.id,
            })
          );
        }
      } else {
        if (editingIdentity) {
          const targetIndex = nextSavedNotes.findIndex(
            (note) => createNoteIdentity(note) === editingIdentity
          );

          if (targetIndex >= 0) {
            noteData.savedAt = nextSavedNotes[targetIndex].savedAt || now;
            nextSavedNotes[targetIndex] = normalizeSavedNote(noteData);
          } else {
            nextSavedNotes.unshift(normalizeSavedNote(noteData));
          }
        } else {
          nextSavedNotes.unshift(normalizeSavedNote(noteData));
        }
      }

      nextSavedNotes.sort((a, b) => {
        const aTime = new Date(a.savedAt || 0).getTime();
        const bTime = new Date(b.savedAt || 0).getTime();
        return bTime - aTime;
      });

      setSavedNotes(nextSavedNotes);

      setFarmHistory((prev) => addToHistory(prev, noteData.farm));
      setVarietyHistory((prev) => addToHistory(prev, noteData.variety));
      setDripperHistory((prev) => addToHistory(prev, noteData.dripper));
      setRoasterHistory((prev) => addToHistory(prev, noteData.roaster));

      showToast();
      resetForm();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleEdit = (note) => {
    setCountry(note.country || "");
    setFarm(note.farm || "");
    setRoastDate(note.roastDate || "");
    setVariety(note.variety || "");
    setDripper(note.dripper || "");
    setRoaster(note.roaster || "");
    setMemo(note.memo || "");
    setLang(note.lang || "en");
    setMainSelections(safeArray(note.mainSelections));
    setSecondarySelections(safeArray(note.secondarySelections));
    setCupProfileSelections(safeArray(note.cupProfileSelections));
    setEditingIdentity(createNoteIdentity(note));
    setEditingDocId(note.docId || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (noteToDelete) => {
    const deleteIdentity = createNoteIdentity(noteToDelete);

    try {
      if (user?.uid && noteToDelete.docId) {
        await deleteDoc(doc(db, "users", user.uid, "notes", noteToDelete.docId));
      }

      setSavedNotes((prev) =>
        prev.filter((note) => createNoteIdentity(note) !== deleteIdentity)
      );

      if (editingIdentity === deleteIdentity) {
        setEditingIdentity(null);
        setEditingDocId(null);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleDownloadPDF = async (note) => {
  try {
    /* ===== 現在 or 保存ノート ===== */
    const currentDraft = {
      country,
      farm,
      roastDate,
      variety,
      dripper,
      roaster,
      memo,
      lang,
      cupProfileSelections,
      mainSelections,
      secondarySelections,
      savedAt: new Date().toISOString(),
    };

    const target = note ? note : currentDraft;
    const pdfPayload = buildPdfPayload(target, lang);

    /* ===== ファイル名生成 ===== */
    const sanitize = (value, fallback) => {
      const cleaned = String(value || "")
        .trim()
        .replace(/[\\/:*?"<>|]/g, "")
        .replace(/\s+/g, "_");

      return cleaned || fallback;
    };

    const countryPart = sanitize(pdfPayload.country, "UnknownCountry");
    const farmPart = sanitize(pdfPayload.farm, "UnknownFarm");

    const baseDate = pdfPayload.savedAt
      ? new Date(pdfPayload.savedAt)
      : new Date();

    const yyyy = baseDate.getFullYear();
    const mm = String(baseDate.getMonth() + 1).padStart(2, "0");
    const dd = String(baseDate.getDate()).padStart(2, "0");

    const fileName = `${countryPart}_${farmPart}_${yyyy}-${mm}-${dd}.pdf`;

    /* ===== PDF生成 ===== */
    const blob = await pdf(
      <CoffeeFlavorWheelPDF
        language={pdfPayload.lang}
        note={pdfPayload}
        country={pdfPayload.country}
        farm={pdfPayload.farm}
        roastDate={pdfPayload.roastDate}
        variety={pdfPayload.variety}
        dripper={pdfPayload.dripper}
        roaster={pdfPayload.roaster}
        memo={pdfPayload.memo}
        savedAt={pdfPayload.savedAt}
        selectedMainLabels={pdfPayload.selectedMainLabels}
        selectedMiddleLabels={pdfPayload.selectedMiddleLabels}
        selectedLeafLabels={pdfPayload.selectedLeafLabels}
        selectedFlavors={pdfPayload.selectedFlavors}
        cupProfile={pdfPayload.cupProfile}
      />
    ).toBlob();

    /* ===== ダウンロード ===== */
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
a.href = url;
a.download = fileName;
document.body.appendChild(a);
a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("PDF download error:", error);
  }
};

  const inputWrapStyle = {
    position: "relative",
    width: "100%",
  };

  const suggestionBoxStyle = {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 12,
    boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
    zIndex: 30,
    maxHeight: 220,
    overflowY: "auto",
  };

  const suggestionRowStyle = {
    padding: "10px 12px",
    cursor: "pointer",
    borderBottom: "1px solid #f1f1f1",
    fontSize: 14,
    lineHeight: 1.4,
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
  };

  const SuggestionList = ({ items, onSelect, showCount = false }) => {
    if (!items.length) return null;

    return (
      <div style={suggestionBoxStyle}>
        {items.map((item, idx) => {
          const label = typeof item === "string" ? item : item.value;
          const count = typeof item === "string" ? null : item.count;

          return (
            <div
              key={`${label}-${idx}`}
              style={{
                ...suggestionRowStyle,
                borderBottom:
                  idx === items.length - 1 ? "none" : suggestionRowStyle.borderBottom,
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(label);
              }}
            >
              <span>{label}</span>
              {showCount && typeof count === "number" ? (
                <span style={{ color: "#888", fontSize: 12 }}>{count}x</span>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  };

return (
  <>
    <div
      style={{
        minHeight: "100vh",
        background: "#fafafa",
        color: "#111",
      }}
    >
      {savedToast ? (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(17, 17, 17, 0.92)",
            color: "#fff",
            padding: "14px 24px",
            borderRadius: 999,
            fontSize: 16,
            fontWeight: 600,
            zIndex: 1000,
            boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
            pointerEvents: "none",
          }}
        >
          {t(lang, "savedToast")}
        </div>
      ) : null}

      {legalModal ? (
        <LegalModal
          lang={lang}
          type={legalModal}
          onClose={() => setLegalModal(null)}
        />
      ) : null}

      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: "20px 16px 40px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: "16px 16px 14px",
            boxShadow: "0 6px 24px rgba(0,0,0,0.05)",
            marginBottom: 18,
            display: "grid",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 14, color: "#444" }}>
              {authReady ? (
                user ? (
                  <>
                    <strong>{user.displayName || "Logged in"}</strong>
                    <span style={{ color: "#777" }}>
                      {" "}
                      · {user.email || ""}
                    </span>
                    <span style={{ color: "#777" }}>
                      {" "}
                      · {appText(lang, "cloudSyncOn")}
                    </span>
                  </>
                ) : (
                  <span style={{ color: "#777" }}>
                    {appText(lang, "loggedOutStatus")}
                  </span>
                )
              ) : (
                <span style={{ color: "#777" }}>
                  {appText(lang, "checkingLogin")}
                </span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {syncing ? (
                <span style={{ fontSize: 13, color: "#777" }}>
                  {appText(lang, "syncing")}
                </span>
              ) : null}

              {user ? (
                <button type="button" onClick={handleLogout} style={secondaryButtonStyle}>
                  {appText(lang, "logout")}
                </button>
              ) : (
                <button type="button" onClick={handleLogin} style={primaryButtonStyle}>
                  {appText(lang, "loginWithGoogle")}
                </button>
              )}
            </div>
          </div>

          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 16,
              padding: 14,
              background: user ? "#fcfcfc" : "#fafafa",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "flex-start",
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#111",
                  letterSpacing: 0.1,
                }}
              >
                {appText(lang, "accountSectionTitle")}
              </div>

              <div
                style={{
                  fontSize: 12,
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "#f2f2f2",
                  color: "#444",
                  whiteSpace: "nowrap",
                }}
              >
                {user
                  ? appText(lang, "accountModeBadge")
                  : appText(lang, "guestModeBadge")}
              </div>
            </div>

            {!user ? (
              <>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: "#333",
                    marginBottom: 8,
                  }}
                >
                  {appText(lang, "loginShortConsent")}
                </div>

                <div
                  style={{
                    fontSize: 12.5,
                    lineHeight: 1.7,
                    color: "#666",
                    marginBottom: 10,
                  }}
                >
                  {appText(lang, "guestShortNotice")}
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: "#333",
                    marginBottom: 8,
                  }}
                >
                  {appText(lang, "loggedInShortNotice")}
                </div>

                <div
                  style={{
                    fontSize: 12.5,
                    lineHeight: 1.7,
                    color: "#666",
                    marginBottom: 10,
                  }}
                >
                  {appText(lang, "analyticsShortNotice")}
                </div>
              </>
            )}

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => setLegalModal("privacy")}
                style={linkButtonStyle}
              >
                {appText(lang, "legalOpenPrivacy")}
              </button>

              <button
                type="button"
                onClick={() => setLegalModal("terms")}
                style={linkButtonStyle}
              >
                {appText(lang, "legalOpenTerms")}
              </button>

              <button
                type="button"
                onClick={() => setLegalModal("data")}
                style={linkButtonStyle}
              >
                {appText(lang, "legalOpenDataNotice")}
              </button>
            </div>
          </div>
        </div>

        <div className="main-layout">
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              padding: 16,
              boxShadow: "0 6px 24px rgba(0,0,0,0.05)",
              minHeight: 500,
            }}
          >
            <FlavorWheel
              lang={lang}
              mainSelections={mainSelections}
              setMainSelections={setMainSelections}
              secondarySelections={secondarySelections}
              setSecondarySelections={setSecondarySelections}
              cupProfileSelections={cupProfileSelections}
              setCupProfileSelections={setCupProfileSelections}
              selectedMainLabels={mainSelections}
              setSelectedMainLabels={setMainSelections}
              selectedSecondaryLabels={secondarySelections}
              setSelectedSecondaryLabels={setSecondarySelections}
              selectedCupProfileLabels={cupProfileSelections}
              setSelectedCupProfileLabels={setCupProfileSelections}
            />
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              padding: 18,
              boxShadow: "0 6px 24px rgba(0,0,0,0.05)",
              position: "sticky",
              top: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  lineHeight: 1.2,
                }}
              >
                {t(lang, "tastingInfo")}
              </h2>

              <div style={{ display: "flex", gap: 6 }}>
                {["en", "ja", "es"].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    style={{
                      border: "1px solid #ddd",
                      background: lang === code ? "#111" : "#fff",
                      color: lang === code ? "#fff" : "#111",
                      borderRadius: 999,
                      fontSize: 12,
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    {code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div style={{ ...inputWrapStyle, gridColumn: "span 2" }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                  {t(lang, "country")}
                </label>
                <input
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setShowCountrySuggestions(!!e.target.value.trim());
                  }}
                  onFocus={() => setShowCountrySuggestions(!!country.trim())}
                  onBlur={() => {
                    countryBlurTimerRef.current = setTimeout(() => {
                      setShowCountrySuggestions(false);
                    }, 120);
                  }}
                  placeholder={t(lang, "country")}
                  style={inputStyle}
                />
                {showCountrySuggestions && country.trim() ? (
                  <SuggestionList
                    items={countrySuggestions}
                    onSelect={(value) => {
                      setCountry(value);
                      setShowCountrySuggestions(false);
                    }}
                  />
                ) : null}
              </div>

              <div style={inputWrapStyle}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                  {t(lang, "farm")}
                </label>
                <input
                  value={farm}
                  onChange={(e) => {
                    setFarm(e.target.value);
                    setShowFarmSuggestions(!!e.target.value.trim());
                  }}
                  onFocus={() => setShowFarmSuggestions(!!farm.trim())}
                  onBlur={() => {
                    farmBlurTimerRef.current = setTimeout(() => {
                      setShowFarmSuggestions(false);
                    }, 120);
                  }}
                  placeholder={t(lang, "farm")}
                  style={inputStyle}
                />
                {showFarmSuggestions && farm.trim() ? (
                  <SuggestionList
                    items={farmSuggestions}
                    showCount
                    onSelect={(value) => {
                      setFarm(value);
                      setShowFarmSuggestions(false);
                    }}
                  />
                ) : null}
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                  {t(lang, "roastDate")}
                </label>
                <input
                  type="date"
                  value={roastDate}
                  onChange={(e) => setRoastDate(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={inputWrapStyle}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                  {t(lang, "variety")}
                </label>
                <input
                  value={variety}
                  onChange={(e) => {
                    setVariety(e.target.value);
                    setShowVarietySuggestions(!!e.target.value.trim());
                  }}
                  onFocus={() => setShowVarietySuggestions(!!variety.trim())}
                  onBlur={() => {
                    varietyBlurTimerRef.current = setTimeout(() => {
                      setShowVarietySuggestions(false);
                    }, 120);
                  }}
                  placeholder={t(lang, "variety")}
                  style={inputStyle}
                />
                {showVarietySuggestions && variety.trim() ? (
                  <SuggestionList
                    items={varietySuggestions}
                    showCount
                    onSelect={(value) => {
                      setVariety(value);
                      setShowVarietySuggestions(false);
                    }}
                  />
                ) : null}
              </div>

              <div style={inputWrapStyle}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                  {t(lang, "dripper")}
                </label>
                <input
                  value={dripper}
                  onChange={(e) => {
                    setDripper(e.target.value);
                    setShowDripperSuggestions(!!e.target.value.trim());
                  }}
                  onFocus={() => setShowDripperSuggestions(!!dripper.trim())}
                  onBlur={() => {
                    dripperBlurTimerRef.current = setTimeout(() => {
                      setShowDripperSuggestions(false);
                    }, 120);
                  }}
                  placeholder={t(lang, "dripper")}
                  style={inputStyle}
                />
                {showDripperSuggestions && dripper.trim() ? (
                  <SuggestionList
                    items={dripperSuggestions}
                    showCount
                    onSelect={(value) => {
                      setDripper(value);
                      setShowDripperSuggestions(false);
                    }}
                  />
                ) : null}
              </div>

              <div style={{ ...inputWrapStyle, gridColumn: "span 2" }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                  {t(lang, "roaster")}
                </label>
                <input
                  value={roaster}
                  onChange={(e) => {
                    setRoaster(e.target.value);
                    setShowRoasterSuggestions(!!e.target.value.trim());
                  }}
                  onFocus={() => setShowRoasterSuggestions(!!roaster.trim())}
                  onBlur={() => {
                    roasterBlurTimerRef.current = setTimeout(() => {
                      setShowRoasterSuggestions(false);
                    }, 120);
                  }}
                  placeholder={t(lang, "roaster")}
                  style={inputStyle}
                />
                {showRoasterSuggestions && roaster.trim() ? (
                  <SuggestionList
                    items={roasterSuggestions}
                    showCount
                    onSelect={(value) => {
                      setRoaster(value);
                      setShowRoasterSuggestions(false);
                    }}
                  />
                ) : null}
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                  {t(lang, "memo")}
                </label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder={t(lang, "memo")}
                  style={{
                    ...inputStyle,
                    minHeight: 100,
                    resize: "vertical",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 16,
                flexWrap: "wrap",
              }}
            >
              <button type="button" onClick={handleSave} style={primaryButtonStyle}>
                {editingIdentity ? t(lang, "updateNote") : t(lang, "saveNote")}
              </button>

              <button type="button" onClick={resetForm} style={secondaryButtonStyle}>
                {t(lang, "reset")}
              </button>

              <button
                type="button"
                onClick={() => handleDownloadPDF()}
                style={secondaryButtonStyle}
              >
                {t(lang, "pdf")}
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            background: "#fff",
            borderRadius: 24,
            padding: 18,
            boxShadow: "0 6px 24px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 20 }}>{t(lang, "savedNotes")}</h2>

            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t(lang, "searchSavedNotes")}
              style={{
                ...inputStyle,
                width: "min(360px, 100%)",
              }}
            />
          </div>

          {filteredSavedNotes.length === 0 ? (
            <div
              style={{
                padding: "18px 0 8px",
                color: "#666",
                fontSize: 14,
              }}
            >
              {user && authReady && !syncing
                ? "No cloud notes found."
                : t(lang, "noSavedNotes")}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: 14,
              }}
            >
              {filteredSavedNotes.map((note, index) => {
                const visibleMainSelections = getVisibleMainSelections(note.mainSelections);
                const visibleOuterSelections = getVisibleOuterSelections(note.secondarySelections);

                return (
                  <div
                    key={`${createNoteIdentity(note)}-${index}`}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 18,
                      padding: 16,
                      background: "#fcfcfc",
                      width: "100%",
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 600,
                            marginBottom: 4,
                          }}
                        >
                          {[note.country, note.farm].filter(Boolean).join(" / ") ||
                            t(lang, "untitledNote")}
                        </div>

                        {note.savedAt ? (
                          <div style={{ fontSize: 12, color: "#777" }}>
                            {t(lang, "savedAt")}: {formatSavedAt(note.savedAt, note.lang || lang)}
                          </div>
                        ) : null}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleEdit(note)}
                          style={smallButtonStyle}
                        >
                          {t(lang, "edit")}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(note)}
                          style={smallButtonStyle}
                        >
                          {t(lang, "delete")}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadPDF(note)}
                          style={smallButtonStyle}
                        >
                          {t(lang, "pdf")}
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: 10,
                        marginBottom: 12,
                      }}
                    >
                      <InfoItem label={t(lang, "country")} value={note.country} />
                      <InfoItem label={t(lang, "farm")} value={note.farm} />
                      <InfoItem label={t(lang, "roastDate")} value={note.roastDate} />
                      <InfoItem label={t(lang, "variety")} value={note.variety} />
                      <InfoItem label={t(lang, "dripper")} value={note.dripper} />
                      <InfoItem label={t(lang, "roaster")} value={note.roaster} />
                    </div>

                    {note.memo ? (
                      <div
                        style={{
                          marginBottom: 12,
                          width: "100%",
                          minWidth: 0,
                        }}
                      >
                        <div style={sectionBodyStyle}>{note.memo}</div>
                      </div>
                    ) : null}

                    {visibleMainSelections.length > 0 ? (
                      <div style={{ marginBottom: 10 }}>
                        <div style={tagWrapStyle}>
                          {visibleMainSelections.map((item, i) => (
                            <span key={`${item}-${i}`} style={tagStyle}>
                              {translateFlavor(item, lang)}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {visibleOuterSelections.length > 0 ? (
                      <div style={{ marginBottom: 10 }}>
                        <div style={tagWrapStyle}>
                          {visibleOuterSelections.map((item, i) => (
                            <span key={`${item}-${i}`} style={tagStyle}>
                              {translateFlavor(item, lang)}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .main-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(320px, 420px);
          gap: 20px;
          align-items: start;
        }

        input, textarea, button {
          font: inherit;
        }

        @media (max-width: 900px) {
          .main-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>

    <Analytics />
  </>
  );
}

function LegalModal({ lang, type, onClose }) {
  const isData = type === "data";
  const title = isData
    ? appText(lang, "dataHandlingTitle")
    : type === "privacy"
    ? appText(lang, "privacyTitle")
    : appText(lang, "termsTitle");

  const body = isData
    ? appText(lang, "dataHandlingBody")
    : type === "privacy"
    ? appText(lang, "privacyBody")
    : appText(lang, "termsBody");

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 2000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(860px, 100%)",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: 24,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          padding: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
            marginBottom: 14,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                lineHeight: 1.2,
                marginBottom: 6,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#777",
              }}
            >
              {appText(lang, "legalLastUpdatedLabel")}: {appText(lang, "legalUpdatedDate")}
            </div>
          </div>

          <button type="button" onClick={onClose} style={secondaryButtonStyle}>
            {appText(lang, "legalModalClose")}
          </button>
        </div>

        <div
          style={{
            whiteSpace: "pre-wrap",
            fontSize: 14,
            lineHeight: 1.9,
            color: "#222",
          }}
        >
          {body}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: 14,
        padding: "10px 12px",
      }}
    >
      <div style={{ fontSize: 12, color: "#777", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: "#111", wordBreak: "break-word" }}>
        {value || "-"}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: "11px 12px",
  fontSize: 14,
  background: "#fff",
  color: "#111",
  outline: "none",
};

const primaryButtonStyle = {
  border: "none",
  background: "#111",
  color: "#fff",
  borderRadius: 12,
  padding: "12px 16px",
  fontSize: 14,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  border: "1px solid #ddd",
  background: "#fff",
  color: "#111",
  borderRadius: 12,
  padding: "12px 16px",
  fontSize: 14,
  cursor: "pointer",
};

const smallButtonStyle = {
  border: "1px solid #ddd",
  background: "#fff",
  color: "#111",
  borderRadius: 10,
  padding: "8px 12px",
  fontSize: 13,
  cursor: "pointer",
};

const linkButtonStyle = {
  border: "1px solid #e4e4e4",
  background: "#fff",
  color: "#111",
  borderRadius: 999,
  padding: "8px 12px",
  fontSize: 12.5,
  cursor: "pointer",
};

const sectionBodyStyle = {
  fontSize: 14,
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
  width: "100%",
  minWidth: 0,
};

const tagWrapStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const tagStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 999,
  background: "#f3f3f3",
  fontSize: 13,
};

export default App;