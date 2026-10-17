import { LockKeyhole } from 'lucide-react'
import './AboutPrivacyDisclaimer.css'

export default function AboutPrivacyDisclaimer() {
  return (
    <section
      className="about-section-card fc-privacy-notice"
      aria-labelledby="fc-privacy-notice-title"
    >
      <div className="about-section-heading">
        <div className="about-section-icon">
          <LockKeyhole size={21} aria-hidden="true" />
        </div>

        <div>
          <span>Privacy &amp; Confidentiality</span>
          <h2 id="fc-privacy-notice-title">
            Family Connect privacy notice
          </h2>
          <p>
            Important information for residents, families and authorised users.
          </p>
        </div>
      </div>

      <div className="fc-privacy-notice__languages">
        <article
          className="fc-privacy-notice__language"
          lang="en"
          aria-labelledby="fc-privacy-en-title"
        >
          <h3 id="fc-privacy-en-title">English</h3>

          <p>
            All photographs, videos, personal information, care records and
            other content displayed in Family Connect are private and
            confidential.
          </p>

          <p>
            Access is restricted to the owners or authorised management of
            UAQ Elderly Care Centre, authorised family members of the
            respective resident, and other expressly authorised individuals
            using valid usernames and passwords.
          </p>

          <p>
            Each family account is permitted to access information relating
            only to the resident linked to that account.
          </p>

          <p>
            Copying, sharing, forwarding, publishing or distributing
            information or images outside Family Connect without prior
            permission is prohibited.
          </p>

          <p>
            Users must keep their usernames and passwords confidential and
            must not share their accounts with unauthorised individuals.
          </p>
        </article>

        <article
          className="fc-privacy-notice__language"
          lang="ms"
          aria-labelledby="fc-privacy-ms-title"
        >
          <h3 id="fc-privacy-ms-title">Bahasa Melayu</h3>

          <p>
            Segala gambar, video, maklumat peribadi, rekod penjagaan dan
            kandungan lain yang dipaparkan dalam Family Connect adalah
            sulit dan persendirian.
          </p>

          <p>
            Akses hanya dibenarkan kepada pemilik atau pihak pengurusan
            UAQ Elderly Care Centre yang diberi kuasa, ahli keluarga residen
            berkenaan yang dibenarkan, serta individu lain yang mendapat
            kebenaran khusus dan menggunakan nama pengguna serta kata
            laluan yang sah.
          </p>

          <p>
            Setiap akaun keluarga hanya dibenarkan mengakses maklumat
            berkaitan residen yang dipautkan kepada akaun tersebut.
          </p>

          <p>
            Penyalinan, perkongsian, penghantaran semula, penerbitan atau
            penyebaran maklumat dan gambar ke luar Family Connect tanpa
            kebenaran terlebih dahulu adalah dilarang.
          </p>

          <p>
            Pengguna hendaklah merahsiakan nama pengguna dan kata laluan
            masing-masing serta tidak berkongsi akaun dengan individu
            yang tidak dibenarkan.
          </p>
        </article>
      </div>

      <p className="fc-privacy-notice__footer">
        © UAQ Elderly Care Centre · Private &amp; Confidential ·
        For Authorised Users Only
      </p>
    </section>
  )
}
