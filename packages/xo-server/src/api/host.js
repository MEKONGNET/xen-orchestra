import { format } from 'json-rpc-peer'

// ===================================================================

export async function set({
  host,

  iscsiIqn,
  multipathing,
  name_label: nameLabel,
  name_description: nameDescription,
}) {
  host = this.getXapiObject(host)

  await Promise.all([
    iscsiIqn !== undefined &&
      (host.iscsi_iqn !== undefined
        ? host.set_iscsi_iqn(iscsiIqn)
        : host.update_other_config(
            'iscsi_iqn',
            iscsiIqn === '' ? null : iscsiIqn
          )),
    nameDescription !== undefined && host.set_name_description(nameDescription),
    nameLabel !== undefined && host.set_name_label(nameLabel),
    multipathing !== undefined &&
      host.$xapi.setHostMultipathing(host.$id, multipathing),
  ])
}

set.description = 'changes the properties of an host'

set.params = {
  id: { type: 'string' },
  iscsiIqn: { type: 'string', optional: true },
  name_label: {
    type: 'string',
    optional: true,
  },
  name_description: {
    type: 'string',
    optional: true,
  },
  multipathing: {
    type: 'boolean',
    optional: true,
  },
}

set.resolve = {
  host: ['id', 'host', 'administrate'],
}

// -------------------------------------------------------------------

// FIXME: set force to false per default when correctly implemented in
// UI.
export function restart({ host, force = true }) {
  return this.getXapi(host).rebootHost(host._xapiId, force)
}

restart.description = 'restart the host'

restart.params = {
  id: { type: 'string' },
  force: {
    type: 'boolean',
    optional: true,
  },
}

restart.resolve = {
  host: ['id', 'host', 'operate'],
}

// -------------------------------------------------------------------

export function restartAgent({ host }) {
  return this.getXapi(host).restartHostAgent(host._xapiId)
}

restartAgent.description = 'restart the Xen agent on the host'

restartAgent.params = {
  id: { type: 'string' },
}

restartAgent.resolve = {
  host: ['id', 'host', 'administrate'],
}

// TODO: remove deprecated alias
export { restartAgent as restart_agent } // eslint-disable-line camelcase

// -------------------------------------------------------------------

export function setRemoteSyslogHost({ host, syslogDestination }) {
  return this.getXapi(host).setRemoteSyslogHost(host._xapiId, syslogDestination)
}

setRemoteSyslogHost.params = {
  id: { type: 'string' },
  syslogDestination: { type: 'string' },
}

setRemoteSyslogHost.resolve = {
  host: ['id', 'host', 'administrate'],
}

// -------------------------------------------------------------------

export function start({ host }) {
  return this.getXapi(host).powerOnHost(host._xapiId)
}

start.description = 'start the host'

start.params = {
  id: { type: 'string' },
}

start.resolve = {
  host: ['id', 'host', 'operate'],
}

// -------------------------------------------------------------------

export function stop({ host }) {
  return this.getXapi(host).shutdownHost(host._xapiId)
}

stop.description = 'stop the host'

stop.params = {
  id: { type: 'string' },
}

stop.resolve = {
  host: ['id', 'host', 'operate'],
}

// -------------------------------------------------------------------

export function detach({ host }) {
  return this.detachHostFromPool(host._xapiId)
}

detach.description = 'eject the host of a pool'

detach.params = {
  id: { type: 'string' },
}

detach.resolve = {
  host: ['id', 'host', 'administrate'],
}

// -------------------------------------------------------------------

export function enable({ host }) {
  return this.getXapi(host).enableHost(host._xapiId)
}

enable.description = 'enable to create VM on the host'

enable.params = {
  id: { type: 'string' },
}

enable.resolve = {
  host: ['id', 'host', 'administrate'],
}

// -------------------------------------------------------------------

export function disable({ host }) {
  return this.getXapi(host).disableHost(host._xapiId)
}

disable.description = 'disable to create VM on the hsot'

disable.params = {
  id: { type: 'string' },
}

disable.resolve = {
  host: ['id', 'host', 'administrate'],
}

// -------------------------------------------------------------------

export function forget({ host }) {
  return this.getXapi(host).forgetHost(host._xapiId)
}

forget.description = 'remove the host record from XAPI database'

forget.params = {
  id: { type: 'string' },
}

forget.resolve = {
  host: ['id', 'host', 'administrate'],
}

// -------------------------------------------------------------------

export function emergencyShutdownHost({ host }) {
  return this.getXapi(host).emergencyShutdownHost(host._xapiId)
}

emergencyShutdownHost.description = 'suspend all VMs and shutdown host'

emergencyShutdownHost.params = {
  host: { type: 'string' },
}

emergencyShutdownHost.resolve = {
  host: ['host', 'host', 'administrate'],
}

// -------------------------------------------------------------------

export async function isHostServerTimeConsistent({ host }) {
  return this.getXapi(host).isHostServerTimeConsistent(host._xapiRef)
}

isHostServerTimeConsistent.params = {
  host: { type: 'string' },
}

isHostServerTimeConsistent.resolve = {
  host: ['host', 'host', 'administrate'],
}

// -------------------------------------------------------------------

export function stats({ host, granularity }) {
  return this.getXapiHostStats(host._xapiId, granularity)
}

stats.description = 'returns statistic of the host'

stats.params = {
  host: { type: 'string' },
  granularity: {
    type: 'string',
    optional: true,
  },
}

stats.resolve = {
  host: ['host', 'host', 'view'],
}

// -------------------------------------------------------------------

async function handleInstallSupplementalPack(req, res, { hostId }) {
  const xapi = this.getXapi(hostId)

  // Timeout seems to be broken in Node 4.
  // See https://github.com/nodejs/node/issues/3319
  req.setTimeout(43200000) // 12 hours
  req.length = req.headers['content-length']
  await xapi.installSupplementalPack(req, { hostId })
  res.end(format.response(0))
}

export async function installSupplementalPack({ host }) {
  return {
    $sendTo: await this.registerHttpRequest(handleInstallSupplementalPack, {
      hostId: host.id,
    }),
  }
}

installSupplementalPack.description = 'installs supplemental pack from ISO file'

installSupplementalPack.params = {
  host: { type: 'string' },
}

installSupplementalPack.resolve = {
  host: ['host', 'host', 'admin'],
}

// -------------------------------------------------------------------

export function isHyperThreadingEnabled({ host }) {
  return this.getXapi(host).isHyperThreadingEnabled(host._xapiId)
}

isHyperThreadingEnabled.description = 'get hyper-threading information'

isHyperThreadingEnabled.params = {
  id: { type: 'string' },
}

isHyperThreadingEnabled.resolve = {
  host: ['id', 'host', 'administrate'],
}
