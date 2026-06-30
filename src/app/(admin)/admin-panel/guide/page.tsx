import { Info, Image as ImageIcon, Video, FileText, Star, AlertCircle } from "lucide-react";
import { FadeIn } from "@/components/ui/FadeIn";

export default function GuidePage() {
  return (
    <FadeIn className="max-w-4xl pb-12">
      <div className="mb-10">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black dark:text-white mb-2" style={{ fontFamily: "var(--font-space-grotesk)"}}>
          Довідник Редактора<span className="text-accent">.</span>
        </h1>
        <p className="text-zinc-500 font-medium">Усе, що потрібно знати про форматування та публікацію матеріалів.</p>
      </div>

      <div className="space-y-8">
        {/* Section 1: In-text Media */}
        <section className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4 mb-6 border-b border-zinc-200 dark:border-zinc-800/50 pb-6">
            <div className="bg-blue-500/10 text-blue-500 p-3 rounded-2xl border border-blue-500/20">
              <ImageIcon size={24} />
            </div>
            <h2 className="text-2xl font-black uppercase text-black dark:text-white" style={{ fontFamily: "var(--font-space-grotesk)"}}>Вставка Фото та Відео</h2>
          </div>
          
          <div className="text-zinc-600 dark:text-zinc-300">
            <p className="text-base mb-6">
              Ви можете вставляти завантажені медіафайли прямо у текст статті. Для цього використовується спеціальна команда <code className="bg-zinc-100 dark:bg-white/10 text-black dark:text-white px-2 py-1 rounded-md">[media:НОМЕР]</code>. Також ви можете завантажувати файли з комп'ютера/телефону або вставляти посилання (наприклад з <strong className="text-black dark:text-white">Google Диску</strong>).
            </p>
            
            <div className="bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 my-6">
              <h4 className="font-bold mb-4 uppercase tracking-widest text-[10px] text-zinc-500">Як це працює:</h4>
              <ol className="space-y-3 font-medium text-sm text-zinc-600 dark:text-zinc-400">
                <li><strong className="text-black dark:text-white">1.</strong> Спочатку завантажте фото або відео до статті через кнопку <strong className="text-black dark:text-white">"Додати Медіа"</strong> внизу редактора.</li>
                <li><strong className="text-black dark:text-white">2.</strong> Кожен завантажений файл отримує свій порядковий номер (1, 2, 3...).</li>
                <li><strong className="text-black dark:text-white">3.</strong> У тексті статті напишіть команду <code className="bg-zinc-200 dark:bg-white/10 text-black dark:text-white px-1.5 py-0.5 rounded text-xs">[media:1]</code> там, де хочете побачити перше фото.</li>
                <li><strong className="text-black dark:text-white">4.</strong> На сайті замість цієї команди з'явиться велика красива фотографія або відеоплеєр.</li>
              </ol>
            </div>

            <div className="bg-[#0a0a0a] border border-zinc-800 text-white p-6 rounded-2xl font-mono text-xs md:text-sm shadow-inner overflow-x-auto">
              <span className="text-zinc-600">{"// Приклад тексту статті:"}</span><br /><br />
              <span className="text-zinc-400">Сьогодні ми поговоримо про новий альбом. Він починається з дуже потужного треку.</span><br />
              <span className="text-accent font-bold bg-accent/10 px-1 rounded">[media:1]</span><br />
              <span className="text-zinc-400">Але далі звучання кардинально змінюється. Ось погляньте на кліп:</span><br />
              <span className="text-accent font-bold bg-accent/10 px-1 rounded">[media:2]</span>
            </div>
            
            <div className="flex items-start gap-4 mt-6 bg-amber-500/10 text-amber-600 dark:text-amber-500 p-5 rounded-2xl border border-amber-500/20">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-relaxed m-0"><strong className="text-amber-700 dark:text-amber-400 uppercase tracking-widest text-[10px] block mb-1">Важливо</strong> Якщо ви завантажили медіа, але не використали команду <code className="bg-amber-500/20 px-1 py-0.5 rounded text-xs">[media:X]</code> у тексті, цей файл взагалі не буде показаний на сторінці статті!</p>
            </div>

            <div className="bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 mt-6">
              <h4 className="font-bold mb-4 uppercase tracking-widest text-[10px] text-zinc-500">Завантаження та Конвертація Файлів:</h4>
              <ul className="text-sm font-medium space-y-3 text-zinc-600 dark:text-zinc-300 list-disc pl-5 marker:text-black dark:marker:text-white">
                <li><strong className="text-black dark:text-white">Завантаження з пристрою:</strong> У профілі, статтях та оглядах є можливість завантажувати обкладинки, галерею та аватарки прямо з вашого пристрою.</li>
                <li><strong className="text-black dark:text-white">Конвертор GIF:</strong> Якщо у вас є коротке відео (.mp4, .mov), яке ви хочете використати як "живу" обкладинку (щоб вона працювала навіть на iPhone в режимі економії енергії), перейдіть у вкладку <strong className="text-pink-500">GIF Конвертор</strong> в меню адмінки. Сервер автоматично перетворить відео на справжню гіфку!</li>
                <li><strong className="text-black dark:text-white">Аудіо-треки для Оглядів:</strong> Щоб в огляді запрацювала кнопка "СЛУХАТИ", вам потрібно додати посилання на трек (Spotify, Soundcloud) або завантажити MP3/WAV у розділ "Галерея / Медіа" під час створення статті, обравши для цього медіа тип <strong className="text-blue-500">AUDIO</strong>.</li>
                <li><strong className="text-black dark:text-white">Google Диск:</strong> Якщо у вас є посилання на фото з Google Диску, просто вставте його у поле URL. Система автоматично перетворить його так, щоб картинка відображалась на сайті.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Markdown Basics */}
        <section className="bg-white dark:bg-[#111] rounded-3xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-800 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
          <h2 className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white mb-6 flex items-center gap-3">
            <span className="bg-blue-500/10 text-blue-500 p-2 rounded-xl"><FileText size={20} /></span>
            Основи Markdown
          </h2>
          <div className="text-zinc-600 dark:text-zinc-300">
            <p className="text-sm font-medium mb-6">
              Редактор підтримує базові можливості для структурування тексту. Ви можете використовувати ці теги безпосередньо у полі "Текст Статті".
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-50 dark:bg-[#151515] p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <h4 className="font-bold mb-2 text-black dark:text-white">Жирний текст та курсив</h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Для виділення візьміть слово у зірочки:</p>
                <code className="text-[10px] font-mono bg-zinc-200 dark:bg-black p-1.5 rounded text-accent block">**Жирний текст**</code>
                <code className="text-[10px] font-mono bg-zinc-200 dark:bg-black p-1.5 rounded text-accent block mt-1">*Курсив*</code>
              </div>
              <div className="bg-zinc-50 dark:bg-[#151515] p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <h4 className="font-bold mb-2 text-black dark:text-white">Заголовки</h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Використовуйте решітку <code className="bg-zinc-200 dark:bg-black px-1 rounded">#</code> перед текстом:</p>
                <code className="text-[10px] font-mono bg-zinc-200 dark:bg-black p-1.5 rounded text-accent block"># Головний заголовок</code>
                <code className="text-[10px] font-mono bg-zinc-200 dark:bg-black p-1.5 rounded text-accent block mt-1">## Підзаголовок</code>
              </div>
              <div className="bg-zinc-50 dark:bg-[#151515] p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <h4 className="font-bold mb-2 text-black dark:text-white">Списки</h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Починайте рядок з тире <code className="bg-zinc-200 dark:bg-black px-1 rounded">-</code> :</p>
                <code className="text-[10px] font-mono bg-zinc-200 dark:bg-black p-1.5 rounded text-accent block whitespace-pre">- Перший пункт<br/>- Другий пункт</code>
              </div>
              <div className="bg-zinc-50 dark:bg-[#151515] p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <h4 className="font-bold mb-2 text-black dark:text-white">Посилання</h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Текст у квадратних дужках, лінк у круглих:</p>
                <code className="text-[10px] font-mono bg-zinc-200 dark:bg-black p-1.5 rounded text-accent block break-all">[Слухати](https://spotify.com/...)</code>
              </div>
              <div className="bg-zinc-50 dark:bg-[#151515] p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 md:col-span-2">
                <h4 className="font-bold mb-2 text-black dark:text-white">Цитати</h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Починайте цитату зі знаку більше <code className="bg-zinc-200 dark:bg-black px-1 rounded">{">"}</code> :</p>
                <code className="text-[10px] font-mono bg-zinc-200 dark:bg-black p-1.5 rounded text-accent block">{">"} "Цей альбом змінив моє життя", — сказав артист.</code>
              </div>
              <div className="bg-zinc-50 dark:bg-[#151515] p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 md:col-span-2">
                <h4 className="font-bold mb-2 text-black dark:text-white">Вбудовані плеєри (Embeds)</h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Вставляйте посилання на YouTube, Spotify або Apple Music прямо в текст за допомогою цих тегів (кожен з нового рядка):</p>
                <code className="text-[10px] font-mono bg-zinc-200 dark:bg-black p-1.5 rounded text-accent block break-all">[youtube:https://youtube.com/watch?v=...]</code>
                <code className="text-[10px] font-mono bg-zinc-200 dark:bg-black p-1.5 rounded text-accent block break-all mt-1">[spotify:https://open.spotify.com/album/...]</code>
                <code className="text-[10px] font-mono bg-zinc-200 dark:bg-black p-1.5 rounded text-accent block break-all mt-1">[apple:https://music.apple.com/us/album/...]</code>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Reviews */}
        <section className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4 mb-6 border-b border-zinc-200 dark:border-zinc-800/50 pb-6">
            <div className="bg-purple-500/10 text-purple-500 p-3 rounded-2xl border border-purple-500/20">
              <Star size={24} />
            </div>
            <h2 className="text-2xl font-black uppercase text-black dark:text-white" style={{ fontFamily: "var(--font-space-grotesk)"}}>Створення Оглядів</h2>
          </div>
          
          <div className="text-zinc-600 dark:text-zinc-300">
            <p className="text-base">
              Щоб стаття стала "Оглядом" (Review) і отримала картку з оцінками, потрібно:
            </p>
            
            <ul className="space-y-2 mt-4 font-medium list-disc pl-5 marker:text-black dark:marker:text-white">
              <li>Створити статтю в категорії <strong className="text-black dark:text-white">"Огляди"</strong> (або Reviews). Картка огляду з'явиться автоматично!</li>
              <li>Заповнити назву треку/альбому та ім'я артиста.</li>
              <li>Виставити 5 редакційних оцінок (Текст, Біт, Звучання, Вайб, Харизма) від 1 до 10.</li>
              <li><strong className="text-accent">Магія:</strong> Натисніть кнопку <strong className="text-black dark:text-white">"ЗНАЙТИ"</strong>, і система автоматично спробує знайти обкладинку в Apple Music, посилання на прослуховування (YouTube/Spotify) та точну <strong className="text-black dark:text-white">Дату Релізу</strong>!</li>
              <li>Якщо система не знайшла трек (наприклад, андеграунд), ви можете вставити посилання на картинку та обрати дату в календарі вручну.</li>
            </ul>

            <div className="bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 mt-8">
              <h4 className="font-bold mb-4 uppercase tracking-widest text-[10px] text-zinc-500">Як працюють "Релізи цього тижня":</h4>
              <p className="text-sm font-medium mb-3 text-zinc-600 dark:text-zinc-300">
                На сайті є вкладка "Релізи цього тижня". Вона працює повністю автоматично!
              </p>
              <ul className="text-sm font-medium space-y-2 text-zinc-500 dark:text-zinc-400 list-disc pl-5 marker:text-black dark:marker:text-white">
                <li>Вона фільтрує огляди виключно за їх <strong className="text-black dark:text-white">Датою релізу</strong> (від поточного понеділка до неділі).</li>
                <li>Кожного понеділка о 00:00 ця вкладка автоматично очищується, готуючись до нових п'ятничних дропів.</li>
                <li>Якщо ви додаєте старий альбом (наприклад, 2010 року), він не з'явиться в "Релізах цього тижня", а піде одразу в "Усі огляди".</li>
              </ul>
            </div>

            <div className="bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 mt-6">
              <h4 className="font-bold mb-4 uppercase tracking-widest text-[10px] text-zinc-500">Розумні автоматизації:</h4>
              <ul className="text-sm font-medium space-y-3 text-zinc-600 dark:text-zinc-300 list-disc pl-5 marker:text-black dark:marker:text-white">
                <li><strong className="text-black dark:text-white">Порожня дата релізу:</strong> Якщо ви забули вказати дату релізу, система автоматично підставить <strong className="text-black dark:text-white">поточний день</strong>. Так жоден новий трек не "загубиться" повз огляди тижня!</li>
                <li><strong className="text-black dark:text-white">Розумне очищення посилань:</strong> Якщо ви скопіювали посилання на обкладинку, а воно вставилося з технічним сміттям (наприклад <code className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px]">background-image: url("...")</code>), не хвилюйтесь! Система сама знайде потрібне посилання, відкине сміття і успішно збереже фотографію.</li>
                <li><strong className="text-black dark:text-white">Автоматичні категорії:</strong> На сайті тепер діють чіткі розділи для контенту: Сингли, Альбоми, Кліпи, Плейлисти. Переконайтеся, що ви обираєте правильний тип під час створення огляду.</li>
              </ul>
            </div>
            
            <div className="bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 mt-6">
              <h4 className="font-bold mb-4 uppercase tracking-widest text-[10px] text-zinc-500">Як вираховується оцінка:</h4>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                На сторінці огляду користувачі бачать дві великі цифри: 
                <br /><br />
                <strong className="text-black dark:text-white">1. Редакційна оцінка:</strong> Це сума ваших 5 параметрів (Текст + Біт + Звучання + Вайб + Харизма). Максимум 50 балів (або 100, якщо ви ставите по 20).
                <br /><br />
                <strong className="text-black dark:text-white">2. Оцінка користувачів:</strong> Сайт дозволяє читачам ставити свої власні оцінки за тими ж 5 критеріями і писати рецензії. Система автоматично вираховує середнє арифметичне всіх оцінок користувачів.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Navigation */}
        <section className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4 mb-6 border-b border-zinc-200 dark:border-zinc-800/50 pb-6">
            <div className="bg-orange-500/10 text-orange-500 p-3 rounded-2xl border border-orange-500/20">
              <Star size={24} />
            </div>
            <h2 className="text-2xl font-black uppercase text-black dark:text-white" style={{ fontFamily: "var(--font-space-grotesk)"}}>Пошук та Навігація</h2>
          </div>
          
          <div className="text-zinc-600 dark:text-zinc-300">
            <p className="text-base mb-4">
              Сайт має потужну систему фільтрації та пошуку:
            </p>
            <ul className="space-y-3 font-medium list-disc pl-5 marker:text-black dark:marker:text-white">
              <li className="text-zinc-500 dark:text-zinc-400"><strong className="text-black dark:text-white">Пошук за артистом:</strong> В Усіх оглядах ви можете ввести частину імені артиста (наприклад "Kanye") і знайти всі його релізи.</li>
              <li className="text-zinc-500 dark:text-zinc-400"><strong className="text-black dark:text-white">Комбінація фільтрів:</strong> Ви можете ввести ім'я артиста, обрати вкладку "Альбоми" і сортування "Найкращі", щоб знайти топ альбомів конкретного виконавця!</li>
            </ul>
          </div>
        </section>
      </div>
    </FadeIn>
  );
}
